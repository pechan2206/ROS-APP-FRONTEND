// Platos.jsx — Pantalla para agregar platos a un pedido
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { platosService } from "../../services/platosService";
import { categoriaPlatoService } from "../../services/categoriaPlatoService";
import { detallePedidoService } from "../../services/detallePedidoService";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const F = "ui-sans-serif, system-ui, -apple-system, sans-serif";
const C = {
  bg:"#f3f4f6",white:"#ffffff",surface:"#f9fafb",
  border:"#e5e7eb",border2:"#d1d5db",
  text:"#1f2937",text2:"#374151",muted:"#6b7280",
  primary:"#2563eb",primaryHover:"#1d4ed8",primaryLight:"#eff6ff",primaryText:"#1d4ed8",
  success:"#16a34a",danger:"#dc2626",dangerLight:"#fef2f2",
};

const formatCOP = (n) => "$" + Number(n).toLocaleString("es-CO");

function Btn({ children, onClick, variant="primary", small, fullWidth, disabled }) {
  const vs = {
    primary:{bg:C.primary,color:"#fff",hov:C.primaryHover},
    success:{bg:C.success,color:"#fff",hov:"#15803d"},
    gray:{bg:C.white,color:C.text2,hov:C.bg},
  };
  const v = vs[variant]||vs.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{fontFamily:F,fontSize:small?"0.75rem":"0.875rem",fontWeight:600,padding:small?"0.3rem 0.65rem":"0.55rem 1.1rem",borderRadius:"8px",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,display:"inline-flex",alignItems:"center",gap:"0.35rem",whiteSpace:"nowrap",transition:"all 0.15s",width:fullWidth?"100%":"auto",justifyContent:fullWidth?"center":"flex-start",background:v.bg,color:v.color,border:variant==="gray"?`1px solid ${C.border2}`:"none",boxShadow:variant==="gray"?"none":"0 1px 2px rgba(0,0,0,0.08)"}}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.background=v.hov;}}
      onMouseLeave={e=>{if(!disabled)e.currentTarget.style.background=v.bg;}}
    >{children}</button>
  );
}

function PlatoCard({ plato, cantidadEnCarrito, onAgregar, onQuitar }) {
  const en = cantidadEnCarrito > 0;
  return (
    <div style={{fontFamily:F,background:C.white,border:`2px solid ${en?C.primary:C.border}`,borderRadius:"14px",overflow:"hidden",boxShadow:en?`0 0 0 3px ${C.primary}18,0 2px 8px rgba(0,0,0,0.06)`:"0 1px 3px rgba(0,0,0,0.06)",transition:"all 0.2s",display:"flex",flexDirection:"column"}}>
      <div style={{height:"90px",background:plato.imagen?`url(${plato.imagen}) center/cover`:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {!plato.imagen&&"🍽️"}
      </div>
      <div style={{padding:"0.75rem",flex:1,display:"flex",flexDirection:"column",gap:"0.3rem"}}>
        <div style={{fontSize:"0.875rem",fontWeight:700,color:C.text,lineHeight:1.3}}>{plato.nombre}</div>
        {plato.descripcion&&<div style={{fontSize:"0.7rem",color:C.muted,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{plato.descripcion}</div>}
        {plato.categoriaPlato?.nombre&&<span style={{display:"inline-block",background:C.primaryLight,color:C.primaryText,fontSize:"0.65rem",fontWeight:600,padding:"0.1rem 0.45rem",borderRadius:"9999px",width:"fit-content"}}>{plato.categoriaPlato.nombre}</span>}
        <div style={{fontSize:"1rem",fontWeight:700,color:C.text,marginTop:"auto",paddingTop:"0.35rem"}}>{formatCOP(plato.precio)}</div>
      </div>
      <div style={{padding:"0.65rem 0.75rem",borderTop:`1px solid ${C.border}`,background:C.surface}}>
        {en?(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>onQuitar(plato)} style={{width:"28px",height:"28px",borderRadius:"7px",border:`1px solid ${C.border2}`,background:C.white,color:C.danger,fontWeight:700,fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s"}} onMouseEnter={e=>{e.currentTarget.style.background=C.dangerLight;e.currentTarget.style.borderColor=C.danger;}} onMouseLeave={e=>{e.currentTarget.style.background=C.white;e.currentTarget.style.borderColor=C.border2;}}>−</button>
            <span style={{fontSize:"0.9rem",fontWeight:700,color:C.primary,minWidth:"24px",textAlign:"center"}}>{cantidadEnCarrito}</span>
            <button onClick={()=>onAgregar(plato)} style={{width:"28px",height:"28px",borderRadius:"7px",border:"none",background:C.primary,color:"#fff",fontWeight:700,fontSize:"1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.12s"}} onMouseEnter={e=>e.currentTarget.style.background=C.primaryHover} onMouseLeave={e=>e.currentTarget.style.background=C.primary}>+</button>
          </div>
        ):(
          <button onClick={()=>onAgregar(plato)} style={{fontFamily:F,width:"100%",padding:"0.4rem",background:C.primary,color:"#fff",border:"none",borderRadius:"7px",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",transition:"background 0.12s"}} onMouseEnter={e=>e.currentTarget.style.background=C.primaryHover} onMouseLeave={e=>e.currentTarget.style.background=C.primary}>+ Agregar</button>
        )}
      </div>
    </div>
  );
}

function CarritoRow({ item, onAgregar, onQuitar }) {
  return (
    <div style={{fontFamily:F,display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.6rem 0",borderBottom:`1px solid ${C.border}`}}>
      <div style={{flex:1,overflow:"hidden"}}>
        <div style={{fontSize:"0.82rem",fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.nombre}</div>
        <div style={{fontSize:"0.7rem",color:C.muted}}>{formatCOP(item.precio)} c/u</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"0.25rem",background:C.bg,border:`1px solid ${C.border}`,borderRadius:"7px",padding:"0.15rem"}}>
        <button onClick={()=>onQuitar(item)} style={{width:"20px",height:"20px",border:"none",background:"transparent",color:C.danger,fontWeight:700,cursor:"pointer",borderRadius:"4px",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.dangerLight} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>−</button>
        <span style={{fontSize:"0.8rem",fontWeight:700,minWidth:"16px",textAlign:"center",color:C.text}}>{item.cantidad}</span>
        <button onClick={()=>onAgregar(item)} style={{width:"20px",height:"20px",border:"none",background:"transparent",color:C.primary,fontWeight:700,cursor:"pointer",borderRadius:"4px",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.primaryLight} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>+</button>
      </div>
      <div style={{fontSize:"0.82rem",fontWeight:700,color:C.text,minWidth:"65px",textAlign:"right"}}>{formatCOP(Number(item.precio)*item.cantidad)}</div>
    </div>
  );
}

export default function Platos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dataPlatos, dataCategorias] = await Promise.all([
          platosService.listar(),
          categoriaPlatoService.listar(),
        ]);
        setPlatos(dataPlatos);
        setCategorias(dataCategorias);
      } catch (e) { console.error("Error al cargar:", e); }
      finally { setLoading(false); }
    };
    cargar();
  }, []);

  const platosFiltrados = platos.filter(p => {
    const matchCat = categoriaActiva === null || p.categoriaPlato?.idCategoria === categoriaActiva;
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  const agregarAlCarrito = (plato) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.idPlato === plato.idPlato);
      if (existe) return prev.map(p => p.idPlato === plato.idPlato ? {...p,cantidad:p.cantidad+1} : p);
      return [...prev, {...plato,cantidad:1}];
    });
  };

  const quitarDelCarrito = (plato) => {
    setCarrito(prev =>
      prev.map(p => p.idPlato === plato.idPlato ? {...p,cantidad:p.cantidad-1} : p)
          .filter(p => p.cantidad > 0)
    );
  };

  const cantidadEnCarrito = (idPlato) => carrito.find(p => p.idPlato === idPlato)?.cantidad || 0;
  const totalItems = carrito.reduce((s,p) => s+p.cantidad, 0);
  const subtotal = carrito.reduce((s,p) => s+Number(p.precio)*p.cantidad, 0);
  const total = subtotal;

  const guardarPedido = async () => {
    const confirm = await MySwal.fire({title:"¿Guardar pedido?",text:"Se agregarán los platos seleccionados al pedido",icon:"question",showCancelButton:true,confirmButtonText:"Sí, guardar",cancelButtonText:"Cancelar",confirmButtonColor:C.primary,cancelButtonColor:C.danger});
    if (!confirm.isConfirmed) return;
    setGuardando(true);
    try {
      for (const p of carrito) {
        await detallePedidoService.crear({
          pedido:{idPedido:Number(id)},
          plato:{idPlato:p.idPlato},
          cantidad:p.cantidad,
          precioUnitario:p.precio,
          subtotal:Number(p.precio)*p.cantidad,
        });
      }
      await MySwal.fire({icon:"success",title:"Pedido guardado",text:"Los productos fueron añadidos correctamente",timer:1500,showConfirmButton:false});
      setCarrito([]);
      navigate("/mesero/pedidos");
    } catch (e) {
      console.error("Error:",e);
      MySwal.fire({icon:"error",title:"Error",text:"Ocurrió un error al guardar el pedido"});
    } finally { setGuardando(false); }
  };

  if (loading) return (
    <div style={{fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:"0.75rem",color:C.muted,fontSize:"0.875rem"}}>
      <div style={{width:"18px",height:"18px",border:`2px solid ${C.border2}`,borderTopColor:C.primary,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      Cargando productos…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontFamily:F,background:C.bg,minHeight:"100vh",padding:"1.5rem 0"}}>

        {/* Encabezado */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem",flexWrap:"wrap",gap:"0.75rem"}}>
          <div>
            <p style={{fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.muted,marginBottom:"0.15rem"}}>Pedido #{id}</p>
            <h1 style={{fontSize:"1.75rem",fontWeight:700,color:C.text,lineHeight:1}}>Agregar platos</h1>
          </div>
          <Btn variant="gray" onClick={()=>navigate("/mesero/pedidos")}>← Volver a pedidos</Btn>
        </div>

        {/* Layout */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"1.5rem",alignItems:"start"}}>

          {/* CATÁLOGO */}
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.1rem"}}>
              <input type="text" placeholder="Buscar plato…" value={busqueda} onChange={e=>setBusqueda(e.target.value)}
                style={{fontFamily:F,width:"100%",background:C.white,border:`1px solid ${C.border2}`,color:C.text,padding:"0.6rem 0.85rem",borderRadius:"8px",fontSize:"0.875rem",outline:"none",boxShadow:"0 1px 2px rgba(0,0,0,0.04)",transition:"border-color 0.15s,box-shadow 0.15s"}}
                onFocus={e=>{e.target.style.borderColor=C.primary;e.target.style.boxShadow=`0 0 0 3px ${C.primary}18`;}}
                onBlur={e=>{e.target.style.borderColor=C.border2;e.target.style.boxShadow="0 1px 2px rgba(0,0,0,0.04)";}}
              />
              <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                <button onClick={()=>setCategoriaActiva(null)} style={{fontFamily:F,display:"inline-flex",alignItems:"center",gap:"0.35rem",padding:"0.35rem 0.85rem",borderRadius:"9999px",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",border:"1px solid",transition:"all 0.15s",background:categoriaActiva===null?C.text2:C.white,color:categoriaActiva===null?"#fff":C.text2,borderColor:categoriaActiva===null?C.text2:C.border2}}>
                  Todas <span style={{background:categoriaActiva===null?"rgba(255,255,255,0.2)":C.bg,color:categoriaActiva===null?"#fff":C.muted,fontSize:"0.7rem",fontWeight:700,padding:"0.05rem 0.4rem",borderRadius:"9999px"}}>{platos.length}</span>
                </button>
                {categorias.map(cat=>{
                  const activo=categoriaActiva===cat.idCategoria;
                  const cnt=platos.filter(p=>p.categoriaPlato?.idCategoria===cat.idCategoria).length;
                  return (
                    <button key={cat.idCategoria} onClick={()=>setCategoriaActiva(activo?null:cat.idCategoria)} style={{fontFamily:F,display:"inline-flex",alignItems:"center",gap:"0.35rem",padding:"0.35rem 0.85rem",borderRadius:"9999px",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",border:"1px solid",transition:"all 0.15s",background:activo?C.primary:C.primaryLight,color:activo?"#fff":C.primaryText,borderColor:activo?C.primary:`${C.primaryText}44`}}>
                      {cat.nombre} <span style={{background:activo?"rgba(255,255,255,0.25)":`${C.primaryText}22`,color:activo?"#fff":C.primaryText,fontSize:"0.7rem",fontWeight:700,padding:"0.05rem 0.4rem",borderRadius:"9999px"}}>{cnt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p style={{fontSize:"0.78rem",color:C.muted,marginBottom:"0.9rem"}}>
              {platosFiltrados.length===platos.length?`${platos.length} platos disponibles`:`${platosFiltrados.length} de ${platos.length} platos`}
            </p>

            {platosFiltrados.length===0?(
              <div style={{textAlign:"center",padding:"3rem 1rem",color:C.muted}}>
                <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>🍽️</div>
                <p style={{fontWeight:600,color:C.text2,marginBottom:"0.3rem"}}>Sin resultados</p>
                <p style={{fontSize:"0.875rem"}}>No se encontraron platos con ese filtro</p>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:"1rem"}}>
                {platosFiltrados.map(p=>(
                  <PlatoCard key={p.idPlato} plato={p} cantidadEnCarrito={cantidadEnCarrito(p.idPlato)} onAgregar={agregarAlCarrito} onQuitar={quitarDelCarrito}/>
                ))}
              </div>
            )}
          </div>

          {/* CARRITO */}
          <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:"16px",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.07)",position:"sticky",top:"1rem",display:"flex",flexDirection:"column"}}>
            <div style={{background:C.surface,padding:"1rem 1.25rem",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <p style={{fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.muted,marginBottom:"0.1rem"}}>Resumen</p>
                <h2 style={{fontSize:"1.1rem",fontWeight:700,color:C.text}}>Carrito</h2>
              </div>
              {carrito.length>0&&<span style={{background:C.primary,color:"#fff",fontSize:"0.72rem",fontWeight:700,padding:"0.2rem 0.6rem",borderRadius:"9999px"}}>{totalItems} {totalItems===1?"item":"items"}</span>}
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"0.25rem 1.25rem",maxHeight:"360px"}}>
              {carrito.length===0?(
                <div style={{textAlign:"center",padding:"2rem 0",color:C.muted}}>
                  <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🛒</div>
                  <p style={{fontSize:"0.82rem"}}>Agrega platos al carrito</p>
                </div>
              ):carrito.map(item=>(
                <CarritoRow key={item.idPlato} item={item} onAgregar={agregarAlCarrito} onQuitar={quitarDelCarrito}/>
              ))}
            </div>

            {carrito.length>0&&(
              <div style={{padding:"1rem 1.25rem",borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",flexDirection:"column",gap:"0.35rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.82rem",color:C.muted}}><span>Subtotal</span><span>{formatCOP(subtotal)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"1rem",fontWeight:700,color:C.text,borderTop:`1px solid ${C.border2}`,marginTop:"0.2rem",paddingTop:"0.6rem"}}><span>Total</span><span>{formatCOP(total)}</span></div>
                <div style={{display:"flex",gap:"0.5rem",marginTop:"0.4rem"}}>
                  <button onClick={()=>setCarrito([])} style={{fontFamily:F,padding:"0.55rem 0.75rem",borderRadius:"8px",border:`1px solid ${C.border2}`,background:C.white,color:C.muted,fontSize:"0.78rem",fontWeight:600,cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background=C.dangerLight;e.currentTarget.style.color=C.danger;e.currentTarget.style.borderColor=C.danger;}} onMouseLeave={e=>{e.currentTarget.style.background=C.white;e.currentTarget.style.color=C.muted;e.currentTarget.style.borderColor=C.border2;}}>🗑️</button>
                  <Btn variant="success" fullWidth onClick={guardarPedido} disabled={guardando}>{guardando?"Guardando…":"Guardar pedido"}</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}