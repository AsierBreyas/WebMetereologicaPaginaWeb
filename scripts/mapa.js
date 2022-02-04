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
fetch('http://10.10.17.170/api').then(response => response.json()).then(registroTiempo => {
    var aPrueba = registroTiempo;
    aPrueba.forEach(element => {
        var localidad = { 'localidad': element.municipio, 'Temperatura': true, 'Viento': false, 'Tiempo': true, 'Precipitacion': false, 'Humedad': false };
        var marker = L.marker([parseFloat((element.latitud).replace(',', '.')), parseFloat((element.longitud).replace(',', '.'))]).on('click', function () { Añadir(localidad) });
        group.addLayer(marker);
        element.marker_id = group.getLayerId(marker);
        //Una vez terminado el mapa vamos a mirar si en el localStorage está algo guardado y lo metemos en el HTML
        localStorage.getItem(element.municipio) != null ? GenerarDatos(element.municipio) : "";
    });
})
group.addTo(mymap);
$('#btnMapa').on('click', function () { $('#map').toggle('slow') })
$(".draggable").draggable({
    zIndex: 100,
    revert: true,
    revertDuration: 0,
    start: function (event, ui) {
        $('.ui-droppable').css('background-color', '#19875')
    },
    stop: function (event, ui) {
        $('.ui-droppable').css('background-color', '#939393')
    }
});
$("#campos").html() === '\n\n\n            ' ? $("#campos").html(sNoCampos) : "";
localStorage.getItem('modo') === 'oscuro' ? modoOscuro() : modoClaro();
$('#cambiaColor').on('click', function(){cambiarColores()});
function activarDrop(id) {
    $(`#${id}`).droppable({
        drop: function (event, ui) {
            var opcion = $(ui.draggable).attr("alt");
            var localidad = JSON.parse(localStorage.getItem(id));
            localidad[opcion] = true;
            localStorage.setItem(localidad.localidad, JSON.stringify(localidad));
            hacerOpciones(opcion, id);
        }
    });
}
function cambiarColores() {
    if (localStorage.getItem('modo') === 'oscuro') {
        localStorage.setItem('modo', 'claro');
        modoClaro();
    } else if (localStorage.getItem('modo') === 'claro') {
        localStorage.setItem('modo', 'oscuro');
        modoOscuro();
    } else {
        localStorage.setItem('modo', 'claro');
    }
}
function modoClaro(){
    $('.navbar').removeClass('navbar-dark');
    $('.navbar').removeClass('bg-dark');
    $('.navbar').addClass('navbar-light');
    $('.navbar').addClass('bg-light');
    $('body').css('background-color', 'rgb(200, 200, 200)');
    $('h3').css('color','rgb(33, 37, 41)');
    $('h4').css('color','rgb(33, 37, 41)');
    $('h5').css('color','rgb(33, 37, 41)');
    $('.iconoJackson').removeClass('bi-moon');
    $('.iconoJackson').addClass(' bi-brightness-high-fill');
    $('#map').css('box-shadow', 'rgb(161, 161, 161) 5px 5px 5px 0px');
    $('.div').css('border','2px solid rgb(71, 71, 71)');
    $('.card').css('background-color', 'rgb(147, 147, 147)');
}

function modoOscuro(){
    $('.navbar').removeClass('navbar-light');
    $('.navbar').removeClass('bg-light');
    $('.navbar').addClass('navbar-dark');
    $('.navbar').addClass('bg-dark');
    $('.iconoJackson').removeClass(' bi-brightness-high-fill');
    $('.iconoJackson').addClass('bi-moon');
    $('body').css('background-color', 'rgb(55, 55,55 )');
    $('h3').css('color', 'rgb(184, 188, 192)');
    $('h4').css('color', 'rgb(184, 188, 192)');
    $('h5').css('color', 'rgb(184, 188, 192)');
    $('#map').css('box-shadow','rgb(80, 80, 80) 5px 5px 5px 0px');
    $('.div').css('border','2px solid rgb(121, 121, 121)');
    $('.card').css('background-color', 'rgb(77, 77, 77)');
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
    $(`.opcion`).on('click', function () {
        var opcion = $(this).attr('id');
        var id = $(this).attr('alt');
        var localidad = JSON.parse(localStorage.getItem(id));
        localidad[opcion] = false;
        localStorage.setItem(localidad.localidad, JSON.stringify(localidad));
        hacerOpciones(opcion, id);
        activarDrop(id);
    });
}
function GenerarDatos(Codigo) {
    fetch(`http://10.10.17.170/api/${Codigo}`).then(response => response.json()).then(unRegistroTiempo => {
        var sDatoNuevo = `<div class="card col " id="${Codigo}">  <div class="card-body>"> <h4 class="card-title"> ${unRegistroTiempo["municipio"]}</h4>`;
        sDatoNuevo += `<button class="btn-close" id="btn${Codigo}" value="${Codigo}" aria-label="Cerrar pestaña"></button>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Tiempo'><h5 class="bi bi-cloud"  role="img" alt="Tiempo"> ${unRegistroTiempo["descripcion"]} </h5><h5 class='bi bi-x-octagon opcion' id="Tiempo" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Temperatura'><h5 class="bi bi-thermometer" role="img" alt="Temperatura"> ${unRegistroTiempo["temperatura"]} ºC </h5><h5 class='bi bi-x-octagon opcion' id="Temperatura" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Viento'><h5 class="bi bi-wind"  role="img" alt="Viento"> ${unRegistroTiempo["velocidadViento"]} km/h </h5><h5 class='bi bi-x-octagon opcion' id="Viento" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Humedad'><h5 class="bi bi-water"  role="img" alt="Humedad"> ${unRegistroTiempo["humedad"]} %</h5><h5 class='bi bi-x-octagon opcion' id="Humedad" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Precipitacion'><h5 class="bi bi-umbrella" role="img" alt="Precipitacion"> ${unRegistroTiempo["precipitacion"]}% </h5><h5 class='bi bi-x-octagon opcion' id="Precipitacion" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`
        sDatoNuevo += "</div></div>";
        ponerCartas(sDatoNuevo, Codigo);
    });
}
function ponerCartas(html, Codigo) {
    $("#campos").html() === sNoCampos ? $("#campos").html(html) : $("#campos").html($("#campos").html() + html);
    hacerOpciones("Temperatura", Codigo);
    hacerOpciones("Viento", Codigo);
    hacerOpciones("Tiempo", Codigo);
    hacerOpciones("Precipitacion", Codigo);
    hacerOpciones("Humedad", Codigo);
    activarBotones();
    activarDrop(Codigo);
}
function hacerOpciones(opcion, Codigo) {
    var refLocalidad = JSON.parse(localStorage.getItem(Codigo));
    refLocalidad[opcion] === false ? $(`#${Codigo}${opcion}`).hide() : $(`#${Codigo}${opcion}`).show();
}
function EliminarHtml(Codigo) {
    $(`#${Codigo}`).remove();
    $("#campos").html() === '' ? $("#campos").html(sNoCampos) : "";
}