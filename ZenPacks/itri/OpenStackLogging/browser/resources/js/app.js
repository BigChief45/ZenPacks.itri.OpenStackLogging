(function() {
    Ext.Loader.setConfig({
        enabled: true
    });
    
    Ext.application({
        name: 'Zenoss.OpenStackLogging',
        appFolder: "/++resource++openstack_logging/js/",
        launch: function() {
            // Create a dummy Grid Panel
            var test_panel = Ext.create('Ext.panel.Panel', {
                id: 'services-panel',
                title: 'Juju OpenStack Services',
                collapsible: false,
                width: 540,
                height: 580,
                padding: 40,
                border: true,
                layout: 'fit',
            }); // End test_panel
            
            
            // Insert it into the page's main grid
            Ext.getCmp('center_panel').add(test_panel);


            var width = 1200,
                height = 900

            var svg = d3.select('test_panel').append("svg")
                .attr("width", width)
                .attr("height", height);

            var force = d3.layout.force()
                .gravity(1)
                .distance(500)
                .charge(-10000)
                .size([width, height]);

            d3.json("/++resource++openstack_logging/data/graphFile.json", function(json) {
                force
                    .nodes(json.nodes)
                    .links(json.links)
                    .start();

                var link = svg.selectAll(".link")
                    .data(json.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .style("stroke-width", 3);

                var node = svg.selectAll(".node")
                    .data(json.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .call(force.drag);
  
                // Append the icon
                node.append("image")
                    .attr("xlink:href", function(d) { return ("/++resource++openstack_logging/img/icons/services/" + d.icon) })
                    .attr("height", 72)
                    .attr("width", 72);

                node.append("text")
                    .attr("dx", 18)
                    .attr("dy", 90)
                    .text(function(d) { return d.name });

                force.on("tick", function() {
                    link.attr("x1", function(d) { return d.source.x + 36; })
                        .attr("y1", function(d) { return d.source.y + 36; })
                        .attr("x2", function(d) { return d.target.x + 36; })
                        .attr("y2", function(d) { return d.target.y + 36; });

                node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            });
          });

            
        }, // end launch
                    
        setupEvents: function() {
        
        }
    }); // End Ext.application
        

})();
