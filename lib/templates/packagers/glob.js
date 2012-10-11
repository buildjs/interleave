<%= resolvedContent %>
(function(glob) {
    <%= content %>
    
    if (typeof <%= moduleExport %> != 'undefined') {
        glob.<%= moduleName %> = <%= moduleExport %>;
    }
}(this));