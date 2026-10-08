// ===== CONFIGURACIÓN =====
const CLAVE = "anotacionesRapidas"; // clave con la que se guarda en localStorage
const MAXIMO = 100;                 // letras máximas por anotación
// "borrador" es lo que está escrito en el campo; "filtro" puede ser todas, pendientes o hechas
let estado = { borrador: "", filtro: "todas", notas: [] };
const $ = (id) => document.getElementById(id); // atajo para buscar elementos por id
// ===== LOCALSTORAGE =====
// Guarda el estado completo como texto JSON
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
// Recupera el estado guardado (si existe) al abrir o refrescar la página
function cargar() { const g = localStorage.getItem(CLAVE); if (g) estado = JSON.parse(g); }
// ===== LISTA =====
// Devuelve solo las notas que corresponden al filtro elegido
function visibles() {
    return estado.notas.filter((n) => estado.filtro === "todas" || (estado.filtro === "hechas") === n.hecha);
}
// Crea el elemento HTML de una nota (textContent evita que se ejecute código escrito por el usuario)
function crearNota(n) {
    const li = document.createElement("li");
    li.className = "nota c" + n.color + (n.hecha ? " hecha" : "");
    li.dataset.id = n.id; // guarda el id para saber cuál nota se toca
    const texto = document.createElement("p");
    texto.className = "texto"; texto.textContent = n.texto;
    const pie = document.createElement("div");
    pie.className = "pie-nota";
    const label = document.createElement("label");
    const casilla = document.createElement("input");
    casilla.type = "checkbox"; casilla.checked = n.hecha;
    label.append(casilla, " Hecha");
    const eliminar = document.createElement("button");
    eliminar.className = "eliminar"; eliminar.textContent = "Eliminar";
    pie.append(label, eliminar); li.append(texto, pie);
    return li;
}
// Dibuja la lista, el contador, la barra de progreso y los filtros
function pintar() {
    const lista = visibles();
    $("lista").innerHTML = "";
    lista.forEach((n) => $("lista").appendChild(crearNota(n)));
    const total = estado.notas.length, hechas = estado.notas.filter((n) => n.hecha).length;
    $("contador").textContent = (total - hechas) + " pendientes de " + total;
    $("progreso").style.width = total ? (hechas / total) * 100 + "%" : "0%";
    document.querySelectorAll(".filtro").forEach((b) => b.classList.toggle("activo", b.dataset.filtro === estado.filtro));
    const vacios = { todas: "Aún no hay anotaciones. Escribe la primera arriba.", pendientes: "No tienes anotaciones pendientes.", hechas: "Todavía no marcaste ninguna como hecha." };
    $("vacio").textContent = vacios[estado.filtro];
    $("vacio").classList.toggle("oculto", lista.length > 0);
}
// ===== ACCIONES =====
// Actualiza el texto "0 / 100" debajo del campo
function contarLetras() { $("caracteres").textContent = $("campo-nota").value.length + " / " + MAXIMO; }
// Cada vez que se escribe, se guarda el borrador para no perderlo al refrescar
function alEscribir() { estado.borrador = $("campo-nota").value; contarLetras(); guardar(); }
// Valida el texto y agrega una nota nueva al principio de la lista
function agregar() {
    const texto = $("campo-nota").value.trim();
    $("error").classList.toggle("oculto", texto !== "");
    if (texto === "") return;
    const id = Math.max(0, ...estado.notas.map((n) => n.id)) + 1; // id único: el mayor que existe + 1
    estado.notas.unshift({ id: id, texto: texto, hecha: false, color: Math.floor(Math.random() * 4) });
    estado.filtro = "todas"; // para que la nota nueva siempre se vea
    estado.borrador = ""; $("campo-nota").value = "";
    contarLetras(); guardar(); pintar(); $("campo-nota").focus();
}
// Busca la nota tocada por su id (guardado en el elemento li)
function buscar(elemento) {
    const id = Number(elemento.closest("li").dataset.id);
    return estado.notas.find((n) => n.id === id);
}
// Elimina una nota de la lista
function eliminar(nota) { estado.notas = estado.notas.filter((n) => n !== nota); guardar(); pintar(); }
// ===== EVENTOS =====
$("btn-agregar").addEventListener("click", agregar);
$("campo-nota").addEventListener("input", alEscribir);
// Permite agregar con la tecla Enter dentro del campo
$("campo-nota").addEventListener("keydown", (e) => e.key === "Enter" && agregar());
// Un solo "escucha" en la lista sirve para todas las notas (incluso las nuevas)
$("lista").addEventListener("click", (e) => { if (e.target.classList.contains("eliminar")) eliminar(buscar(e.target)); });
$("lista").addEventListener("change", (e) => { buscar(e.target).hecha = e.target.checked; guardar(); pintar(); });
// Cada botón de filtro guarda su opción y vuelve a dibujar
document.querySelectorAll(".filtro").forEach((b) => b.addEventListener("click", () => { estado.filtro = b.dataset.filtro; guardar(); pintar(); }));
$("btn-completadas").addEventListener("click", () => { estado.notas = estado.notas.filter((n) => !n.hecha); guardar(); pintar(); });
$("btn-todo").addEventListener("click", () => {
    if (estado.notas.length && confirm("¿Seguro que quieres borrar todas las anotaciones?")) { estado.notas = []; guardar(); pintar(); }
});
// ===== ARRANQUE =====
// Al cargar la página se recupera lo guardado y se muestra de nuevo
cargar();
$("campo-nota").value = estado.borrador;
contarLetras();
pintar();