//---------------------------------------//
//--|funcionalidad_anotaciones_rapidas|--//
//---------------------------------------//
const CLAVE = "anotacionesRapidas";
const MAXIMO = 100;
let estado = {
    borrador: "", filtro: "todas", notas: []
};
const $ = (id) => document.getElementById(id);
//------------------------------------------------//
//--|funcionalidad_guardar_y_cargar_anotaciones|--//
//------------------------------------------------//
function guardar() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
function cargar() {
    const g = localStorage.getItem(CLAVE);
    if (g) {
        estado = JSON.parse(g);
    }
}
//---------------------------------------//
//--|funcionalidad_filtrar_anotaciones|--//
//---------------------------------------//
function visibles() {
    return estado.notas.filter((n) => estado.filtro === "todas" || (estado.filtro === "hechas") === n.hecha);
}
//--------------------------------------------------//
//--|funcionalidad_crear_elementos_de_anotaciones|--//
//--------------------------------------------------//
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
//---------------------------------------------------//
//--|funcionalidad_actualizar_interfaz_anotaciones|--//
//---------------------------------------------------//
function pintar() {
    const lista = visibles();
    $("lista").innerHTML = "";
    lista.forEach((n) => {
        $("lista").appendChild(crearNota(n));
    });
    const total = estado.notas.length;
    const hechas = estado.notas.filter((n) => n.hecha).length;
    $("contador").textContent = (total - hechas) + " pendientes de " + total;
    $("progreso").style.width = total ? (hechas / total) * 100 + "%" : "0%";
    document.querySelectorAll(".filtro").forEach((b) => {
        b.classList.toggle("activo", b.dataset.filtro === estado.filtro);
    });
    const vacios = {
        todas: "Aún no hay anotaciones. Escribe la primera arriba.",
        pendientes: "No tienes anotaciones pendientes.",
        hechas: "Todavía no marcaste ninguna como hecha."
    };
    $("vacio").textContent = vacios[estado.filtro];
    $("vacio").classList.toggle("oculto", lista.length > 0);
}
//-------------------------------------------------//
//--|funcionalidad_contador_y_borrador_anotacion|--//
//-------------------------------------------------//
function contarLetras() {
    $("caracteres").textContent = $("campo-nota").value.length + " / " + MAXIMO;
}
function alEscribir() {
    estado.borrador = $("campo-nota").value;
    contarLetras();
    guardar();
}
//-------------------------------------------//
//--|funcionalidad_agregar_nueva_anotacion|--//
//-------------------------------------------//
function agregar() {
    const texto = $("campo-nota").value.trim();
    $("error").classList.toggle("oculto", texto !== "");
    if (texto === "") {
        return;
    }
    const id = Math.max(0, ...estado.notas.map((n) => n.id)) + 1;
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
//-------------------------------------------------//
//--|funcionalidad_buscar_y_eliminar_anotaciones|--//
//-------------------------------------------------//
function buscar(elemento) {
    const id = Number(elemento.closest("li").dataset.id);
    return estado.notas.find((n) => n.id === id);
}
function eliminar(nota) {
    estado.notas = estado.notas.filter((n) => n !== nota);
    guardar();
    pintar();
}
//--------------------------------------------//
//--|eventos_agregar_y_escribir_anotaciones|--//
//--------------------------------------------//
$("btn-agregar").addEventListener("click", agregar);
$("campo-nota").addEventListener("input", alEscribir);
$("campo-nota").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        agregar();
    }
});
//-------------------------------------------//
//--|eventos_eliminar_y_marcar_anotaciones|--//
//-------------------------------------------//
$("lista").addEventListener("click", (e) => {
    if (e.target.classList.contains("eliminar")) {
        eliminar(buscar(e.target));
    }
});
$("lista").addEventListener("change", (e) => {
    buscar(e.target).hecha = e.target.checked;
    guardar();
    pintar();
});
//---------------------------------//
//--|eventos_filtrar_anotaciones|--//
//---------------------------------//
document.querySelectorAll(".filtro").forEach((b) => {
    b.addEventListener("click", () => {
        estado.filtro = b.dataset.filtro;
        guardar();
        pintar();
    });
});
//----------------------------------------------//
//--|eventos_eliminar_anotaciones_completadas|--//
//----------------------------------------------//
$("btn-completadas").addEventListener("click", () => {
    estado.notas = estado.notas.filter((n) => !n.hecha);
    guardar();
    pintar();
});
//--------------------------------------------//
//--|eventos_eliminar_todas_las_anotaciones|--//
//--------------------------------------------//
$("btn-todo").addEventListener("click", () => {
    if (estado.notas.length && confirm("¿Seguro que quieres borrar todas las anotaciones?")) {
        estado.notas = [];
        guardar();
        pintar();
    }
});
//-------------------------------------//
//--|inicializacion_de_la_aplicacion|--//
//-------------------------------------//
cargar();
$("campo-nota").value = estado.borrador;
contarLetras();
pintar();