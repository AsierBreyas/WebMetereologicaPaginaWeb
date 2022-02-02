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
fetch('https://localhost:5001/api/Tiempo').then(response => response.json()).then(registroTiempo => {
    aPrueba = registroTiempo;
    aPrueba.forEach(element => {
        var localidad = { 'localidad': element.municipio, 'Temperatura': true, 'Viento': false, 'Tiempo': true, 'Precipitacion': false };
        var marker = L.marker([parseFloat((element.latitud).replace(',', '.')), parseFloat((element.longitud).replace(',', '.'))]).on('click', function () { Añadir(localidad) });
        group.addLayer(marker);
        element.marker_id = group.getLayerId(marker);
        //Una vez terminado el mapa vamos a mirar si en el localStorage está algo guardado y lo metemos en el HTML
        localStorage.getItem(element.municipio) !=null ? GenerarDatos(element.municipio) : "";
    });
})
aLocalizaciones = JSON.parse(sLocalizaciones);
group.addTo(mymap);
$('#btnMapa').on('click', function () { $('#map').toggle('slow') })
$(".draggable").draggable({
    zIndex: 100,
    revert: true,
    revertDuration: 0
});
$("#campos").html() === '\n\n\n            ' ? $("#campos").html(sNoCampos) : "";
// $('#campos').droppable({
//     drop: function (event, ui) {
//         var id = $(ui.draggable).attr("alt");
//         localStorage.getItem(id) != 'true' ? hacerOpciones(id, true) : "";
//     }
// });
function activarDrop(id){
    console.log(id);
    $(`#${id}`).droppable({
        drop: function (event, ui) {
            var opcion = $(ui.draggable).attr("alt");
            localidad = JSON.parse(localStorage.getItem(id));
            localidad[opcion] = true;
            alert(localidad.localidad)
            localStorage.setItem(localidad.localidad ,JSON.stringify(localidad));
            hacerOpciones(opcion, id);
        }
    });
}

function Añadir(oLocalidad) {
    // var localidad = { 'localidad': Nombre, 'Temperatura': true, 'Viento': false, 'Tiempo': true, 'Precipitacion': false };
    localStorage.getItem(oLocalidad.localidad) === null ? localStorage.setItem(oLocalidad.localidad, JSON.stringify(oLocalidad)) : localStorage.removeItem(oLocalidad.localidad);
    // localStorage.getItem(Codigo) === null ? localStorage.setItem(Codigo, Nombre) : localStorage.removeItem(Codigo);
    $(`#${oLocalidad.localidad}`).html() === undefined ? GenerarDatos(oLocalidad.localidad) : EliminarHtml(oLocalidad.localidad);
}
function activarBotones() {
    $(`.btn-close`).on("click", function () {
        $(`#${this.value}`).remove();
        localStorage.removeItem(this.value);
        $("#campos").html() === '' ? $("#campos").html(sNoCampos) : "";
    });
    $(`.opcion`).on('click', function(){
        opcion = $(this.id);
        id = $(this.alt);
        $(`#${id}`).hide();
        localidad = JSON.parse(localStorage.getItem(id));
        localidad[opcion] = false;
        localStorage.setItem(localidad.localidad ,JSON.stringify(localidad));
        hacerOpciones(opcion, id);
    });
}
function GenerarDatos(Codigo){
    fetch(`https://localhost:5001/api/Tiempo/${Codigo}`).then(response => response.json()).then(unRegistroTiempo => {
        sDatoNuevo = `<div class="card col Droppable" id="${Codigo}">  <div class="card-body>"> <h4 class="card-title"> ${unRegistroTiempo["municipio"]}</h4>`;
        sDatoNuevo += `<button class="btn-close" id="btn${Codigo}" value="${Codigo}"></button>`;
        sDatoNuevo += `<h5 class="bi bi-thermometer" id='${unRegistroTiempo["municipio"]}Temperatura' role="img" alt="Temperatura"> ${unRegistroTiempo["temperatura"]} ºC</h5><h5 class='bi bi-x-octagon opcion' id="Temperatura" role="img" alt="${unRegistroTiempo["municipio"]}"></h5>`;
        sDatoNuevo += `<h5 class="bi bi-wind" id='${unRegistroTiempo["municipio"]}Viento' role="img" alt="Viento">${unRegistroTiempo["velocidadViento"]} km/h</h5><h5 class='bi bi-x-octagon opcion' id="Viento" role="img" alt="${unRegistroTiempo["municipio"]}"></h5>`;
        sDatoNuevo += `<h5 class="bi bi-cloud" id='${unRegistroTiempo["municipio"]}Tiempo' role="img" alt="Tiempo"><img src='${unRegistroTiempo["pathImg"]}'></img></h5><h5 class='bi bi-x-octagon opcion' id="Tiempo" role="img" alt="${unRegistroTiempo["municipio"]}"></h5>`;
        sDatoNuevo += `<h5 class="bi bi-umbrella" id='${unRegistroTiempo["municipio"]}Precipitacion' role="img" alt="Precipitacion">${unRegistroTiempo["precipitacionAcumulada"]}%</h5><h5 class='bi bi-x-octagon opcion' id="Precipitacion" role="img" alt="${unRegistroTiempo["municipio"]}"></h5>`
        sDatoNuevo += "</div></div>";
        ponerCartas(sDatoNuevo, Codigo);
    });
}
function ponerCartas(html, Codigo){
    $("#campos").html() === sNoCampos ? $("#campos").html(html): $("#campos").html($("#campos").html() + html);
    hacerOpciones("Temperatura", Codigo);
    hacerOpciones("Viento", Codigo);
    hacerOpciones("Tiempo", Codigo);
    hacerOpciones("Precipitacion", Codigo);
    activarBotones();
    activarDrop(Codigo);
}
// function ocultarHtml(opcion, id){
//     localidad = JSON.parse(localStorage.getItem(id));
//     localidad[opcion] = false;
//     localStorage.setItem(localidad.localidad ,JSON.stringify(localidad));
//     hacerOpciones(opcion, id);
// }
function hacerOpciones(opcion, Codigo){
    var refLocalidad = JSON.parse(localStorage.getItem(Codigo));
    refLocalidad[opcion] === false ? $(`#${Codigo}${opcion}`).hide(): $(`#${Codigo}${opcion}`).show();
}
function EliminarHtml(Codigo) {
    $(`#${Codigo}`).remove();
    $("#campos").html() === '' ? $("#campos").html(sNoCampos) : "";
}
// https://www.htmlcinco.com/guardar-un-objeto-o-array-en-localstorage/
// function cargarPagina() {
//     fetch('https://localhost:5001/api/Tiempo').then(response => response.json()).then(registroTiempo => {
//         aPrueba = registroTiempo;
//         aPrueba.forEach(element => {
//             localStorage.getItem(element.municipio) !=null ? AñadirHtml(element.municipio) : "";
//         });
//     });
    
// }