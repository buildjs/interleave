<%= dependencies %>

<%= resolvedContent %>
<%= content %>

if (typeof <%= moduleExport %> != 'undefined') {
    module.exports = <%= moduleExport %>;
}
