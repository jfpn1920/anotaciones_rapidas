//---------------------------------------//
//--|funcionalidad_anotaciones_rapidas|--//
//---------------------------------------//
const CLAVE = "anotacionesRapidas";
const MAXIMO = 100;
let estado = {
    borrador: "", filtro: "todas", notas: []
};
const $ = (id) => document.getElementById(id);
//----------------------------------------------------//
//--|guardar_y_cargar_los_datos_usando_localstorage|--//
//----------------------------------------------------//
function guardar() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
function cargar() {
    const g = localStorage.getItem(CLAVE);
    if (g) {
        estado = JSON.parse(g);
    }
}
// ===== MOSTRAR Y CREAR ANOTACIONES =====
// Devuelve las anotaciones que coinciden con el filtro seleccionado
function visibles() {
    return estado.notas.filter((n) =>
        estado.filtro === "todas" ||
        (estado.filtro === "hechas") === n.hecha
    );
}
// Crea el elemento HTML correspondiente a una anotación
function crearNota(n) {
    const li = document.createElement("li");
    li.className = "nota c" + n.color + (n.hecha ? " hecha" : "");
    li.dataset.id = n.id;
    const texto = document.createElement("p");
    texto.className = "texto";
    texto.textContent = n.texto;
    const pie = document.createElement("div");
    pie.className = "pie-nota";
    const label = document.createElement("label");
    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.checked = n.hecha;
    label.append(casilla, " Hecha");
    const eliminar = document.createElement("button");
    eliminar.className = "eliminar";
    eliminar.textContent = "Eliminar";
    pie.append(label, eliminar);
    li.append(texto, pie);
    return li;
}
// Actualiza la lista, el contador, el progreso y los filtros
function pintar() {
    const lista = visibles();
    $("lista").innerHTML = "";
    lista.forEach((n) => {
        $("lista").appendChild(crearNota(n));
    });
    const total = estado.notas.length;
    const hechas = estado.notas.filter((n) => n.hecha).length;
    $("contador").textContent = (total - hechas) + " pendientes de " + total;
    $("progreso").style.width = total
        ? (hechas / total) * 100 + "%"
        : "0%";
    document.querySelectorAll(".filtro").forEach((b) => {
        b.classList.toggle(
            "activo",
            b.dataset.filtro === estado.filtro
        );
    });
    const vacios = {
        todas: "Aún no hay anotaciones. Escribe la primera arriba.",
        pendientes: "No tienes anotaciones pendientes.",
        hechas: "Todavía no marcaste ninguna como hecha."
    };
    $("vacio").textContent = vacios[estado.filtro];
    $("vacio").classList.toggle("oculto", lista.length > 0);
}
// ===== CAMPO DE TEXTO Y NUEVAS ANOTACIONES =====
// Actualiza el contador de caracteres escritos
function contarLetras() {
    $("caracteres").textContent =
        $("campo-nota").value.length + " / " + MAXIMO;
}
// Guarda el borrador mientras el usuario escribe
function alEscribir() {
    estado.borrador = $("campo-nota").value;
    contarLetras();
    guardar();
}
// Valida el texto y agrega una nueva anotación
function agregar() {
    const texto = $("campo-nota").value.trim();
    $("error").classList.toggle("oculto", texto !== "");
    if (texto === "") {
        return;
    }
    const id = Math.max(
        0,
        ...estado.notas.map((n) => n.id)
    ) + 1;
    estado.notas.unshift({
        id: id,
        texto: texto,
        hecha: false,
        color: Math.floor(Math.random() * 4)
    });
    estado.filtro = "todas";
    estado.borrador = "";
    $("campo-nota").value = "";
    contarLetras();
    guardar();
    pintar();
    $("campo-nota").focus();
}
// ===== BUSCAR Y ELIMINAR ANOTACIONES =====
// Busca una anotación utilizando el identificador de su elemento HTML
function buscar(elemento) {
    const id = Number(elemento.closest("li").dataset.id);
    return estado.notas.find((n) => n.id === id);
}
// Elimina una anotación y actualiza la información guardada
function eliminar(nota) {
    estado.notas = estado.notas.filter((n) => n !== nota);
    guardar();
    pintar();
}
// ===== EVENTOS DE LA APLICACIÓN =====
// Agrega una anotación al pulsar el botón
$("btn-agregar").addEventListener("click", agregar);
// Actualiza el borrador y el contador al escribir
$("campo-nota").addEventListener("input", alEscribir);
// Permite agregar una anotación al pulsar Enter
$("campo-nota").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        agregar();
    }
});
// Detecta los clics en los botones de eliminar de cada anotación
$("lista").addEventListener("click", (e) => {
    if (e.target.classList.contains("eliminar")) {
        eliminar(buscar(e.target));
    }
});
// Actualiza el estado cuando se marca o desmarca una anotación
$("lista").addEventListener("change", (e) => {
    buscar(e.target).hecha = e.target.checked;
    guardar();
    pintar();
});
// Cambia el filtro y actualiza las anotaciones visibles
document.querySelectorAll(".filtro").forEach((b) => {
    b.addEventListener("click", () => {
        estado.filtro = b.dataset.filtro;
        guardar();
        pintar();
    });
});
// Elimina las anotaciones que ya están marcadas como hechas
$("btn-completadas").addEventListener("click", () => {
    estado.notas = estado.notas.filter((n) => !n.hecha);
    guardar();
    pintar();
});
// Elimina todas las anotaciones después de confirmar la acción
$("btn-todo").addEventListener("click", () => {
    if (
        estado.notas.length &&
        confirm("¿Seguro que quieres borrar todas las anotaciones?")
    ) {
        estado.notas = [];
        guardar();
        pintar();
    }
});
// ===== INICIAR LA APLICACIÓN =====
// Recupera los datos y muestra la información al abrir la página
cargar();
$("campo-nota").value = estado.borrador;
contarLetras();
pintar();