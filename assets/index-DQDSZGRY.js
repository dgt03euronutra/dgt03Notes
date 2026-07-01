(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))d(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const e of o.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&d(e)}).observe(document,{childList:!0,subtree:!0});function c(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function d(n){if(n.ep)return;n.ep=!0;const o=c(n);fetch(n.href,o)}})();const h="agenda-entries";function b(t){const a=t.getFullYear(),c=String(t.getMonth()+1).padStart(2,"0"),d=String(t.getDate()).padStart(2,"0");return`${a}-${c}-${d}`}function $(t){const a=t.getItem(h);if(!a)return{};try{const c=JSON.parse(a);return c&&typeof c=="object"?c:{}}catch{return{}}}function S(t,a){a.setItem(h,JSON.stringify(t))}function k(t,a){return new Date(t,a,1).toLocaleDateString("es-ES",{month:"long"})}function w(t){const[a,c,d]=t.split("-").map(Number);return new Date(a,c-1,d).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}function L(){const a=new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"});return`${a.charAt(0).toUpperCase()}${a.slice(1)}`}function E(t,a){const c=new Date(t,a,1),d=new Date(t,a+1,0).getDate(),n=(c.getDay()+6)%7,o=[],e=42,s=[];for(let r=0;r<n;r+=1)s.push(null);for(let r=1;r<=d;r+=1)s.push(r);for(;s.length<e;)s.push(null);for(let r=0;r<e/7;r+=1)o.push(s.slice(r*7,r*7+7));return o}function M(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function O(t,a){const c=window.localStorage,d=new Date,n=d.getFullYear(),o=d.getMonth(),e={year:n,month:o,selectedDate:null,draft:"",entries:$(c),storage:c,feedback:null},s=()=>{var g,l,i;const r=E(e.year,e.month),u=k(e.year,e.month),f=`${u.charAt(0).toUpperCase()}${u.slice(1)}`;t.innerHTML=`
      <section class="agenda">
        <header class="agenda__header">
          <div class="agenda__nav">
            <div class="agenda__nav-group">
              <button type="button" data-action="prev-month" class="agenda__nav-btn">←</button>
              <h1 class="agenda__nav-title">${f}</h1>
              <button type="button" data-action="next-month" class="agenda__nav-btn">→</button>
            </div>
            <button type="button" data-action="today" class="agenda__nav-today">Hoy: ${L()}</button>
            <div class="agenda__nav-group">
              <button type="button" data-action="prev-year" class="agenda__nav-btn">←</button>
              <h1 class="agenda__nav-title">${e.year}</h1>
              <button type="button" data-action="next-year" class="agenda__nav-btn">→</button>
            </div>
          </div>
        </header>

        <div class="agenda__body">
          <div class="agenda__calendar-panel">
            <div class="agenda__grid" role="grid">
              ${["L","M","X","J","V","S","D"].map(p=>`<div class="agenda__weekday">${p}</div>`).join("")}
              ${r.flat().map(p=>{if(p===null)return'<div class="agenda__cell agenda__cell--empty"></div>';const y=b(new Date(e.year,e.month,p)),v=e.selectedDate===y,D=e.entries[y],_=["agenda__cell","agenda__day"];return v&&_.push("agenda__day--selected"),`
                    <button
                      type="button"
                      class="${_.join(" ")}"
                      data-date="${y}"
                    >
                      <span class="agenda__day-number">${p}</span>
                      ${D?'<span class="agenda__note-indicator">•</span>':""}
                    </button>
                  `}).join("")}
            </div>
          </div>

          <section class="agenda__editor-panel">
            ${e.selectedDate?`
              <h2>${w(e.selectedDate)}</h2>
              <textarea data-editor="true" rows="8">${M(e.draft)}</textarea>
              <div class="agenda__actions">
                <button
                  type="button"
                  class="agenda__save-button${(g=e.feedback)!=null&&g.type?` agenda__save-button--${e.feedback.type}`:""}"
                  data-action="save"
                >
                  ${((l=e.feedback)==null?void 0:l.type)==="success"?"Guardado":((i=e.feedback)==null?void 0:i.type)==="error"?"Reintentar":"Guardar"}
                </button>
              </div>
              ${e.feedback?`<p class="agenda__feedback agenda__feedback--${e.feedback.type}">${e.feedback.message}</p>`:""}
              <p class="agenda__hint">Se guarda solo en el almacenamiento local de este navegador.</p>
            `:'<p class="agenda__hint">Selecciona un día para añadir o editar una nota.</p>'}
          </section>
        </div>
      </section>
    `};t.addEventListener("click",r=>{const u=r.target,f=u.closest("[data-action]");if(f){const l=f.dataset.action;if(l==="prev-month"){e.month-=1,e.month<0&&(e.month=11,e.year-=1),e.selectedDate=null,e.draft="",e.feedback=null,s();return}if(l==="next-month"){e.month+=1,e.month>11&&(e.month=0,e.year+=1),e.selectedDate=null,e.draft="",e.feedback=null,s();return}if(l==="prev-year"){e.year-=1,e.selectedDate=null,e.draft="",e.feedback=null,s();return}if(l==="next-year"){e.year+=1,e.selectedDate=null,e.draft="",e.feedback=null,s();return}if(l==="today"){const i=new Date;e.year=i.getFullYear(),e.month=i.getMonth(),e.selectedDate=b(i),e.draft=e.entries[e.selectedDate]??"",e.feedback=null,s();return}if(l==="save"){if(!e.selectedDate){e.feedback={type:"error",message:"Selecciona un día antes de guardar."},s();return}try{const i={...e.entries,[e.selectedDate]:e.draft};S(i,e.storage),e.entries=i,e.feedback={type:"success",message:"Nota guardada correctamente."}}catch{e.feedback={type:"error",message:"No se pudo guardar la nota."}}s();return}}const g=u.closest("[data-date]");g&&(e.selectedDate=g.dataset.date??null,e.draft=e.selectedDate?e.entries[e.selectedDate]??"":"",e.feedback=null,s())}),t.addEventListener("input",r=>{var f;const u=r.target;u.dataset.editor==="true"&&(e.draft=u.value,(f=e.feedback)!=null&&f.type&&(e.feedback=null))},!0),s()}const m=document.querySelector("#app");m&&O(m);
