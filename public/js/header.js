$(function() {
    // Pobranie dynamicznego nagłówka
    $.get("/header", function(data) {
        $("#header").html(data); // Wstawienie wyrenderowanego HTML do kontenera #header
    }).fail(function(xhr) {
        console.error("Error loading header: " + xhr.status + " " + xhr.statusText);
    });
});