{{ copyright }}

{{ requires }}

(function(glob) {
    {{ content }}
    
    if (typeof {{ exports }} != 'undefined') {
        glob.{{ exports }} = {{ exports }};
    }
}(this));