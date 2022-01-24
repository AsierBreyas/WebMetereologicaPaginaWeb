import $ from 'jquery';
window.$ = $;
var latLng = [43.3452544, -1.7967802];
var sNoCampos = "<p>No hay localizaciones seleccionadas, por favor seleccione una</p>";
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
    var marker = L.marker([element.GpxY, element.GpxX]).on('click', function () { Añadir(element.Id, element.Municipio) });
    group.addLayer(marker);
    element.marker_id = group.getLayerId(marker);
});
group.addTo(mymap);
cargarPagina();
function Añadir(Codigo, Nombre) {
    localStorage.getItem(Nombre) === null ? localStorage.setItem(Nombre, Codigo) : localStorage.removeItem(Nombre);
    $(`#${Nombre}`).html() === undefined ? AñadirHtml(Nombre) : EliminarHtml(Nombre);
}

function AñadirHtml(Nombre) {
    if ($(`#${Nombre}`).html() === undefined) {
        sDatoNuevo = `<div class="card col" id="${Nombre}">  <div class="card-body>"> <h4 class="card-title"> ${Nombre}</h4>`;
        sDatoNuevo += `<button class="btn-close" id="btn${Nombre}" value="${Nombre}"></button>`;
        localStorage.getItem("Temperatura") ? sDatoNuevo += `<p class="Temperatura">Temperatura</p>` : "";
        localStorage.getItem("Viento") ? sDatoNuevo += `<p class="Viento">Viento</p>` : "";
        localStorage.getItem("Tiempo") ? sDatoNuevo += `<p class="Tiempo">Tiempo</p>` : "";
        localStorage.getItem("Precipitacion") ? sDatoNuevo += `<p class="Precipitacion">Precipitacion</p>` : "";
        sDatoNuevo += "</div></div>"
        if ($("#campos").html() === sNoCampos) {
            $("#campos").html(sDatoNuevo);
        } else {
            sDatosAntiguos = $("#campos").html()
            $("#campos").html(sDatosAntiguos + sDatoNuevo);
        }
        $(`.btn-close`).on("click", function(){
            $(`#${this.value}`).remove();
            localStorage.removeItem(this.value);
            $("#campos").html() === '\n\n\n            ' ? $("#campos").html(sNoCampos) : "";
        });
    }
    // else{
        
    //     EliminarHtml(Nombre);
    // }

}
function EliminarHtml(Nombre){
    $(`#${Nombre}`).remove();
    $("#campos").html() === '\n\n\n            ' ? $("#campos").html(sNoCampos) : "";
}
function cargarPagina() {
    localStorage.getItem("Temperatura") === null ? localStorage.setItem("Temperatura", true) : "";
    localStorage.getItem("Viento") === null ? localStorage.setItem("Viento", false) : "";
    localStorage.getItem("Tiempo") === null ? localStorage.setItem("Tiempo", true) : "";
    localStorage.getItem("Precipitacion") === null ? localStorage.setItem("Precipitacion", false) : "";
    aLocalizaciones.forEach(element => {
        localStorage.getItem(element.Municipio) != null ? AñadirHtml(element.Municipio) : "";
    });
    $("#campos").html() === '\n\n            ' ? $("#campos").html(sNoCampos) : "";
}
// patata = aLocalizaciones.find(element => element.Municipio == "Irun")
// $.getJSON("Estaciones.json", (data) => {
//     aDatos = data.Localizaciones;
//     $.each(aDatos, (i) => {
//         var marker = L.marker([aDatos[i].GpxY, aDatos[i].GpxX]).on('click', function () { Añadir(aDatos[i].Id, aDatos[i].Nombre) });
//         group.addLayer(marker);
//     })
// });
// $.getJSON("Estaciones.json", function (data, status) { PasarLocalizacionesArray(data, status) });
// group.addTo(mymap);

// function PasarLocalizacionesArray(oJson, Estado) {
//     aLocalizaciones = oJson.Localizaciones;
//     aLocalizaciones.forEach(element => {
//         var marker = L.marker([element.GpxY, element.GpxX]).on('click', function () { Añadir(element.Id, element.Nombre) });
//         group.addLayer(marker);
//         element.marker_id = group.getLayerId(marker);
//     })
// }