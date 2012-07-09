<%= licence %>
<%= dependencies %>
<%= content %>

if (typeof <%= moduleExport %> != 'undefined') {
    module.exports = <%= moduleExport %>;
}
