<%= licence %>
define('<%= moduleName %>', [<%= dependencies.names %>], function(<%= dependencies.exports %>) {
    <%= content %>
    
    return typeof <%= moduleExport %> != 'undefined' ? <%= moduleExport %> : undefined;
});