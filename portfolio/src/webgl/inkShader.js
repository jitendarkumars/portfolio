// Multi-mode background shader. ONE program renders four different looks and
// crossfades between them based on scroll (uPrevMode/uCurMode/uMix):
//   0 = Liquid chrome   1 = Aurora flow   2 = Topographic lines   3 = Dot-matrix wave
// Colors come from uniforms so every mode follows the cream/ink theme.

export const inkVert = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

export const inkFrag = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;
  uniform vec3 uRipple;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uInkAmt;
  uniform int uPrevMode;
  uniform int uCurMode;
  uniform float uMix;

  float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
    float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
  float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p=p*2.0+vec2(1.7,9.2); a*=0.5; } return v; }
  float lum(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }

  // 0 — Liquid chrome: flowing metal, near-grayscale with sheen + rare glint
  vec3 chrome(vec2 p, vec2 m, float t){
    vec2 q=vec2(fbm(p+t*0.06), fbm(p+vec2(5.2,1.3)-t*0.05));
    vec2 r=vec2(fbm(p+2.0*q+m*0.4+vec2(1.7,9.2)), fbm(p+2.0*q-m*0.4+vec2(8.3,2.8)));
    float f=fbm(p+3.0*r);
    vec3 col=mix(uPaper, uInk, smoothstep(0.18,0.85,f));
    float g=lum(col); col=mix(col, vec3(g), 0.55);                 // desaturate -> metallic
    float sheen=pow(0.5+0.5*sin(f*8.0+length(r)*5.0+t*0.4),3.0);
    col+=sheen*0.10;                                               // bright sheen bands
    col+=uAccent*0.05*smoothstep(0.74,0.8,length(r));             // tiny warm glint
    return col;
  }

  // 1 — Aurora flow: soft cool indigo/teal drift
  vec3 aurora(vec2 p, vec2 m, float t){
    vec3 indigo=vec3(0.23,0.20,0.55);
    vec3 teal=vec3(0.13,0.55,0.55);
    float g=smoothstep(0.2,0.85, fbm(p*0.7 + vec2(0.0,t*0.05) + m*0.3));
    vec3 cool=mix(indigo, teal, g);
    float band=fbm(p*0.5 + m*0.4 - vec2(t*0.04,0.0));
    vec3 col=mix(uPaper, cool, smoothstep(0.32,0.85,band)*0.9);
    col+=uAccent*0.06*exp(-distance(vUv,uMouse)*4.0);            // accent glow at cursor
    return col;
  }

  // 2 — Topographic: drifting contour lines, ink with accent every 4th
  vec3 topo(vec2 p, vec2 m, float t){
    float field=fbm(p*1.15 + m*0.4 + vec2(t*0.03,0.0));
    float lines=abs(fract(field*9.0)-0.5)*2.0;
    float l=smoothstep(0.16,0.0,lines);
    vec3 col=uPaper;
    col=mix(col, uInk, l*0.55);
    float idx=floor(field*9.0);
    col=mix(col, uAccent, l*0.8*step(3.5, mod(idx,4.0)));        // accent on every 4th line
    return col;
  }

  // 3 — Dot-matrix wave: grid of dots that ripple, parting near the cursor
  vec3 dots(vec2 p, vec2 m, float t){
    vec2 g=p*4.0;
    vec2 cell=fract(g)-0.5;
    float d=length(cell);
    float dm=distance(p,m);
    float wave=0.5+0.5*sin(t*2.0 - dm*3.0);
    float radius=0.10+wave*0.12;
    float dot=smoothstep(radius, radius-0.06, d);
    vec3 col=uPaper;
    col=mix(col, uInk, dot*0.6);
    col=mix(col, uAccent, dot*smoothstep(1.4,0.0,dm)*0.7);       // accent dots near cursor
    return col;
  }

  vec3 pick(int mode, vec2 p, vec2 m, float t){
    if(mode==0) return chrome(p,m,t);
    else if(mode==1) return aurora(p,m,t);
    else if(mode==2) return topo(p,m,t);
    return dots(p,m,t);
  }

  void main(){
    vec2 uv=vUv; float asp=uRes.x/max(uRes.y,1.0);
    vec2 p=(uv-0.5); p.x*=asp; p*=3.0;
    vec2 m=(uMouse-0.5); m.x*=asp; m*=3.0;

    float rd=distance(uv,uRipple.xy);
    float ring=sin(rd*42.0 - uRipple.z*7.0)*exp(-uRipple.z*1.6)*exp(-rd*7.0);
    p+=ring*0.6;

    float t=uTime;
    vec3 col=pick(uPrevMode,p,m,t);
    if(uMix>0.001){ col=mix(col, pick(uCurMode,p,m,t), uMix); }

    col=mix(uPaper, col, clamp(uInkAmt,0.0,1.0));     // overall strength
    col*=1.0-0.14*length(uv-0.5);                      // gentle vignette
    gl_FragColor=vec4(col,1.0);
  }
`
