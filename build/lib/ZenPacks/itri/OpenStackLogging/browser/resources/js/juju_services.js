(function() {

    Ext.ns('Zenoss.Dashboard');

    /**
     * Juju Services Portlet.
     **/
    Ext.define('Zenoss.Dashboard.portlets.JujuServicesPortlet', {
        extend: 'Zenoss.Dashboard.view.Portlet',
        alias: 'widget.jujuservicesportlet',
        height: 350,
        title: 'Juju Services',
        network: null,
        depth: 3,
        initComponent: function(){
            this.networkMapId = Ext.id();
            Ext.apply(this, {
                items: [{
                    xtype: 'container',
                    id: this.networkMapId
                }],
                height: this.height
            });

            this.callParent(arguments);
            this.on('afterrender', this.buildNetworkMap, this, {single: true});
        },
        destroyOldMap: function() {
            var el = Ext.get(this.networkMapId);
            // destroy all the children and build the map
            while (el.dom.firstChild) {
                el.dom.removeChild(el.dom.firstChild);
            }
        },
        resizeSVG: function(panel, width, height) {
            Ext.get(this.networkMapId).setHeight(height -10);
            Ext.get(this.networkMapId).setWidth(width -10);
            this.svg.attr("height", height);
            this.svg.attr("width", width);
        },
        buildNetworkMap: function() {
            // make sure we have a network first
            if (!this.network) {
                return;
            }
            this.destroyOldMap();
            // resize the svg whenever we are resized
            this.on('resize', this.resizeSVG, this);
            var self = this, attachPoint = d3.select("#" +this.networkMapId);
            self.imageDir="/zport/dmd/img/icons";
            self.selection = "10.171.54.0";
            var width = Math.max(attachPoint.style('width').replace("px", ""), 600);
            var height = Math.max(attachPoint.style('height').replace("px", ""), 400);
            self.attachPoint = attachPoint;


            this.nodes = [];
            this.links = [];
            this.force = d3.layout.force()
                .charge(-1000)
                .theta(0)
                .linkDistance(125)
                .size([width, height])
                .nodes(this.nodes)
                .links(this.links)
                .on("tick", Ext.bind(this.tick, this));
            this.svg = this.attachPoint.append("svg")
                .attr("width", width)
                .attr("height", height);
            self.update();
        },
        tick: function() {
            var node = this.svg.selectAll(".node");
            var link = this.svg.selectAll(".link");
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) { return "translate(" + d.x + ", " + d.y + ")"; });
        },
        onRefresh: function() {
            this.update();
        },
        update: function() {
            var self = this;
            var node = this.svg.selectAll(".node");
            var link = this.svg.selectAll(".link");
            var nodeHeight = 25,
                nodeWidth = 125;
            Zenoss.remote.DashboardRouter.getNetworkMapData({
                uid: self.network,
                depth: self.depth
            }, function(response) {
                if (!response.success) {
                    return;
                }
                var graph = response.data;
                graph.nodes.forEach(function(n){
                    var i =0, found = false;
                    for (i=0; i<self.nodes.length;i++) {
                        if (self.nodes[i].id  === n.id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        self.nodes.push(n);
                    }
                });
                console.log(self.nodes);
                node = node.data(self.force.nodes(), function(d) { return d.id; });
                var nodeContainer = node.enter()
                    .append("g")
                    .attr("class", function(d){ return "node " + d.id; })
                    .call(self.force.drag);
                nodeContainer.append("rect")
                    .attr("width", function(d) {
                        // make the box wider for longer names
                        return Math.max(d.id.length * 8, 125);
                    })
                    .attr("height", nodeHeight)
                    .attr("transform", "translate(" + -nodeWidth/2 + ", " + -nodeHeight/2 + ")")
                    .attr("rx", 10)
                    .attr("ry", 10)
                    .attr("style", function(d){ return "fill:#" + d.color.slice(2);});

                nodeContainer.append("text")
                    .text(function(d){ return d.id; })
                    .attr("dx", -30)
                    .attr("dy", 5);
                nodeContainer.append("svg:image")
                    .attr("xlink:href", function(d){ return self.imageDir + "/" + d.icon; })
                    .attr("height", 30)
                    .attr("width", 30)
                    .attr("x", -nodeWidth/2)
                    .attr("y", -15);
                node.exit().remove();

                graph.links.forEach(function(e){
                    var sourceNode = graph.nodes.filter(function(n) { return n.id === e.source; });
                    var targetNode = graph.nodes.filter(function(n) { return n.id === e.target; });
                    self.links.push({source: sourceNode[0], target: targetNode[0]});
                });

                link = link.data(self.force.links(), function(d) { return d.source.id + "-" + d.target.id; });
                link.enter().insert("line", ".node")
                    .attr("class", "link");
                link.exit().remove();

                self.force.start();
            });
        },
        getConfig: function() {
            return {
                network: this.network
            };
        },
        applyConfig: function(config) {
            if (config.depth) {
                this.depth = config.depth;
            }
            if (this.rendered && config.network && config.network !== this.network) {
                this.network = config.network;
                this.buildNetworkMap();
            }
            this.callParent([config]);
        },
        getCustomConfigFields: function() {
            var fields = [{
                xtype: 'combo',
                name: 'network',
                queryMode: 'local',
                editable: false,
                store: new Zenoss.NonPaginatedStore({
                    directFn: Zenoss.remote.DashboardRouter.getNetworks,
                    root: 'data',
                    fields: ['uid', 'name']
                }),
                displayField: 'name',
                valueField: 'uid',
                fieldLabel: _t('Network'),
                value: this.network
            }, {
                xtype: 'numberfield',
                name: 'depth',
                fieldLabel: _t('Depth'),
                minValue: 0,
                maxValue: 10,
                value: this.depth
            }];
            fields[0].store.load({});
            return fields;
        }
    });

});
