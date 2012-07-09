{{ copyright }}

define('{{ exports }}', [{{ depnames }}], function({{ depexports }}) {
    {{ content }}
    
    return typeof {{ exports }} != 'undefined' ? {{ exports }} : undefined;
});