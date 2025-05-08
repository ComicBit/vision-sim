(async () => {
async function getUserMedia(constraints) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    const gUM = navigator.getUserMedia || navigator.webkitGetUserMedia;
    if (!gUM) throw new Error('getUserMedia not supported');
    return new Promise((res, rej) => gUM.call(navigator, constraints, res, rej));
}

/* ---------- grab prescription from localStorage ------------------------ */
function g(k){return parseFloat(localStorage[k]||0)||0;}
let rx = {
  sphR:g('sphR'), sphL:g('sphL'),
  cylR:g('cylR'), cylL:g('cylL'),
  axR :g('axR'),  axL :g('axL'),
  addR:g('addR'), addL:g('addL')
};

/* ---------- camera ------------------------------------------------------ */
const video = document.getElementById('video');
try{
  const stream = await getUserMedia({ video: { facingMode: 'environment' } })
               .catch(()=> getUserMedia({ video: true }));
  video.srcObject=stream; await video.play();
}catch(e){alert('Camera error: '+e.message);return;}

/* ---------- WebGL ------------------------------------------------------- */
const canvas=document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
if(!gl){alert('WebGL missing');return;}

/* NEW: make the video texture right‑side‑up */
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

function resize(){
  canvas.width=video.videoWidth;canvas.height=video.videoHeight;
  gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);
}
video.addEventListener('loadedmetadata',resize);window.addEventListener('resize',resize);

const vs=`attribute vec2 a;varying vec2 v;
void main(){
  vec2 flipped = vec2(-a.x, a.y);    // horizontal mirror
  v = 0.5 * (flipped + 1.0);
  gl_Position = vec4(a, 0.0, 1.0);
}`;
const fs=`
precision mediump float;
uniform sampler2D u_tex;uniform vec2 u_res;
uniform vec4 u_sph;   /* R,L,AddR,AddL  */
uniform vec4 u_cyl;   /* R,L,axR,axL    */
varying vec2 v;

/* gaussian -------------------------------------------------------------- */
vec3 blur(vec2 uv,float r,float angle){
  if(r<0.3)return texture2D(u_tex,uv).rgb;
  vec2 step = vec2(cos(angle),sin(angle))/u_res*r;
  vec3 c=vec3(0.0);float wSum=0.0;
  for(int i=-4;i<=4;i++){
    float k=float(i);float w=1.0-abs(k)/4.0;
    c+=texture2D(u_tex,uv+k*step).rgb*w;wSum+=w;
  }
  return c/wSum;
}

vec3 simulate(float sph,float add,float cyl,float ax){
  /* mapping: 1 D ≈ 3 px blur radius */
  float baseR = abs(sph)*3.0;
  float nearR = abs(add)*2.0;
  vec3 col = blur(v, baseR, 0.0);      // spherical defocus
  if(cyl!=0.0)
    col = blur(v, abs(cyl)*3.0, radians(ax));   // directional
  if(add>0.0)      // presbyopia contrast loss
    col = mix(vec3(0.5), col, 1.0-0.03*add);
  /* simplistic: near & far behave the same because we lack depth info */
  return col;
}

void main(){
  vec3 r = simulate(u_sph.x, u_sph.z, u_cyl.x, u_cyl.z);
  vec3 l = simulate(u_sph.y, u_sph.w, u_cyl.y, u_cyl.w);
  gl_FragColor = vec4((r+l)*0.5,1.0);
}`;

/* compile */
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);
if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o;}
const prog=gl.createProgram();
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);gl.useProgram(prog);

const buf=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),gl.STATIC_DRAW);
const ap=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);

const tex=gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D,tex);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
gl.uniform1i(gl.getUniformLocation(prog,'u_tex'),0);

const uRes=gl.getUniformLocation(prog,'u_res');
const uSph=gl.getUniformLocation(prog,'u_sph');
const uCyl=gl.getUniformLocation(prog,'u_cyl');

/* ---------- floating editor -------------------------------------------- */
['sphR','sphL','cylR','cylL','axR','axL'].forEach(k=>{
  document.getElementById('f'+k).value = rx[k];
});

const panel = document.getElementById('panel');
document.getElementById('handle').onclick = () =>
  panel.classList.toggle('collapsed');
  
document.getElementById('save').onclick = ()=>{
  ['sphR','sphL','cylR','cylL','axR','axL'].forEach(k=>{
    rx[k]=parseFloat(document.getElementById('f'+k).value)||0;
    localStorage[k]=rx[k];
  });
};

/* ---------- render loop ------------------------------------------------- */
function draw(){
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,video);

  gl.uniform2f(uRes,canvas.width,canvas.height);
  gl.uniform4f(uSph,rx.sphR,rx.sphL,rx.addR,rx.addL);
  gl.uniform4f(uCyl,rx.cylR,rx.cylL,rx.axR,rx.axL);

  gl.drawArrays(gl.TRIANGLES,0,6);
  requestAnimationFrame(draw);
}
resize();draw();
})();
