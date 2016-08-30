
/**
 * Cria um construtor padrão para as visualizações. Permite a reutilização de 
 * código entre várias visualizações diferentes e define alguns métodos que
 * devem ser implementados obrigatoriamente (draw, brush)
 * @constructor
 * 
 * @property {number} h Altura disponível para desenho na visualização.
 * @property {number} w Largura disponível para desenho na visualização.
 * @property {ColorScheme|string} color Cor a ser utilizada na visualização. Caso a cor
 * seja uma string (Ex: <code>"black"<code>) todos itens visuais terão a mesma cor
 * caso seja um objeto deve guardar o esquema de cores e o atributo da base utilizada
 * 
 * @property {object} events Objeto que guarda todos os callback registrados para 
 * cada evento que a visualização dispara.
 * 
 *  
 * 
 * 
 * @example 
//Cria o construtor da visualização desejada
function  Scatter (container){
    //Inicializa algumas variáveis comuns,
    //como altura e largura disponíveis para a visualização
    Visualization.call(this, container);
}
//realiza o link para a delegação de métodos e propriedades
Scatter.prototype = Object.create(Visualization.prototype);
//Cria uma instância dessa visualização
var sca = new Scatter("#container");
 * 
 * 
 * @param {jQuery|string} container Uma seleção do JQuery ou uma string com o 
 * id de um elemento a ser selecionado. Ex: <code>"#minhaDiv"</code>
 * 
 * @returns {Visualization} Um objeto abstrato de visualização.
 */
function Visualization() {
    /**
     * Objeto padrão para definir o esquema de cores utilizado na visualização.
     * 
     * @namespace ColorScheme
     * @property {function} method método utilizado para retornar a cor apropriada dado um valor.
     * @property {string} attr atributo da base que será utilizado para definir a cor.
     */
    
    /**
     * Evento dispara quando o usuário seleciona um ou mais itens visuais.
     *
     * @event Visualization#select
     * @type {object}
     * @property {array} selected Array contendo os itens selecionados.
     */
    
    if (!container)
        container = $("body");
    else if (typeof container === "string")
        container = $(container);

    this.h = container.height();
    this.w = container.width();
    
    this.color = "black";
    
    this.events = {};
}

/**
 * Desenha ou redesenha a visualização dentro do container passado no construtor
 * da visualização. Os dados que devem ser passados como parâmetro dependem do tipo
 * de visualização.
 * 
 * @memberof Visualization
 * 
 * @param {array} metadata Um array contendo informações sobre cada atributo da 
 * base de dados que está sendo visualizada.
 * 
 * @param {array} data Um array contendo todos os dados a serem visualizados.
 */
Visualization.prototype.draw = function (metadata, data) {
    console.log("Sobreescrever esta função!!");
};

/**
 * Dá um destaque a um elemento ou a um conjunto de elementos.
 * 
 * @memberof Visualization
 * 
 * @param {number|array} index índice (ou array de índices) do elemento a ser 
 * destacado dentro do array <code>data</code> passado no metodo
 * <code>vis.draw(metadata, data)</code>.
 */
Visualization.prototype.brush = function () {
    console.log("Sobreescrever esta função!!");
};

/**
 * Registra uma função a ser executada, quando ocorre um evento na visualização.
 * Exemplo: quando um usuário seleciona um item na visualização.
 * 
 * @memberof Visualization
 * 
 * @param {string} callback_type tipo do evento a ser observado pelo callback.
 * @param {function} callback função executada quando o evento ocorrer na visualização.
 */
Visualization.prototype.on = function (e, callback) {
    if(typeof e === "string"){
        if(this.events[e]){
            this.events[e].push(callback);
        }else{
            this.events[e] = [callback];
        }
    }else{
        console.log("o evento a ser registrado precisa ser uma string");
    }
};