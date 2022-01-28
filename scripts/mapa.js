// import $ from 'jquery';
window.$ = $;
var latLng = [43.3452544, -1.7967802];
var sNoCampos = '<p class="col-8">No hay localizaciones seleccionadas, por favor seleccione una</p>';
if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function (pos) {

    //Si es aceptada guardamos lo latitud y longitud
    var lat = pos.coords.latitude;
    var lon = pos.coords.longitude;
    latLng = [lat, lon]

}, function (error) {

    //Si es rechazada enviamos de error por consola
    console.log('Ubicación no activada');
});

import L, { layerGroup } from 'leaflet';
var mymap = L.map('map').setView(latLng, 13);
var group = L.layerGroup();
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org/%22%3EOpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/%22%3ECC-BY-SA</a>, Imagery © <a href="http://cloudmade.com/%22%3ECloudMade</a>',
    minzoom: 13,
    maxZoom: 19
}).addTo(mymap);
L.control.scale().addTo(mymap);
aLocalizaciones = JSON.parse(sLocalizaciones);
aLocalizaciones.forEach(element => {
    var marker = L.marker([element.GpxY, element.GpxX]).on('click', function () { Añadir(element.Id, element.Nombre) });
    group.addLayer(marker);
    element.marker_id = group.getLayerId(marker);
});
group.addTo(mymap);
cargarPagina();
$(".draggable").draggable({
    revert: true,
    revertDuration: 0,
    // start: function(event, ui){
    //     $("#Draggable").droppable('disable');
    // }
});
$('#campos').droppable({
    drop: function (event, ui) {
        var id = $(ui.draggable).attr("alt");
        localStorage.getItem(id) != 'true' ?   hacerOpciones(id, true) : ""; 
    }
});
function hacerOpciones(id, estado){
    sDatos = "";
    localStorage.setItem(id, estado);
    aLocalizaciones.forEach(element => {
        if( localStorage.getItem(element.Id) != null){
            sDatos += GenerarCartas(element.Id);
        }
        $(`#${element.Id}`).html() === undefined ? $('#campos').html(sDatos) : EliminarHtml(element.Id), $('#campos').html(sDatos);
        activarDraggable();
    });
    activarBotones();
}
function Añadir(Codigo, Nombre) {
    localStorage.getItem(Codigo) === null ? localStorage.setItem(Codigo, Nombre) : localStorage.removeItem(Codigo);
    $(`#${Codigo}`).html() === undefined ? AñadirHtml(Codigo) : EliminarHtml(Codigo);
}
function activarDraggable() {
    $(".draggable2").draggable({
        revert: true,
        revertDuration: 0,
        start: function (event, ui) {
            // $("#Draggable").droppable("enable")
            $("#Draggable").droppable({
                disable: false, 
                drop: function (event, ui) {
                    var id = $(ui.draggable).attr("alt");
                    hacerOpciones(id, false);
                }
            });
        }
    });
    
}
function AñadirHtml(Codigo) {
    if ($(`#${localStorage.getItem(Codigo)}`).html() === undefined) {
        if ($("#campos").html() === sNoCampos) {
            $("#campos").html(GenerarCartas(Codigo));
            activarDraggable();
        } else {
            $("#campos").html($("#campos").html() + GenerarCartas(Codigo));
            activarDraggable();
        }
        activarBotones();

    }

}
function activarBotones() {
    $(`.btn-close`).on("click", function () {
        $(`#${this.value}`).remove();
        localStorage.removeItem(this.value);
        $("#campos").html() === '' ? $("#campos").html(sNoCampos) : "";
    });
}
function GenerarCartas(Codigo) {
    sDatoNuevo = `<div class="card col" id="${Codigo}">  <div class="card-body>"> <h4 class="card-title"> ${localStorage.getItem(Codigo)}</h4>`;
    sDatoNuevo += `<button class="btn-close" id="btn${Codigo}" value="${Codigo}"></button>`;
    localStorage.getItem("Temperatura") === 'true' ? sDatoNuevo += `<h5 class="bi bi-thermometer draggable2" role="img" alt="Temperatura"></h5>` : "";
    localStorage.getItem("Viento") === 'true' ? sDatoNuevo += `<h5 class="bi bi-wind draggable2" role="img" alt="Viento"></h5>` : "";
    localStorage.getItem("Tiempo") === 'true' ? sDatoNuevo += `<h5 class="bi bi-cloud draggable2" role="img" alt="Tiempo"></h5>` : "";
    localStorage.getItem("Precipitacion") === 'true' ? sDatoNuevo += `<h5 class="bi bi-umbrella draggable2" role="img" alt="Precipitacion"></h5>` : "";
    sDatoNuevo += "</div></div>"
    return sDatoNuevo;
}
function EliminarHtml(Codigo) {
    $(`#${Codigo}`).remove();
    $("#campos").html() === '' ? $("#campos").html(sNoCampos) : "";
}
function cargarPagina() {
    localStorage.getItem("Temperatura") === null ? localStorage.setItem("Temperatura", false) : "";
    localStorage.getItem("Viento") === null ? localStorage.setItem("Viento", false) : "";
    localStorage.getItem("Tiempo") === null ? localStorage.setItem("Tiempo", false) : "";
    localStorage.getItem("Precipitacion") === null ? localStorage.setItem("Precipitacion", false) : "";
    aLocalizaciones.forEach(element => {
        localStorage.getItem(element.Id) != null ? AñadirHtml(element.Id) : "";
    });
    $("#campos").html() === '\n\n\n            ' ? $("#campos").html(sNoCampos) : "";
}