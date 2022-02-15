
precision mediump float;

varying vec2 v_texcoord;
varying vec4 currCoord;
// out gl_PerVertex { vec4 gl_Position; };

uniform sampler2D textureLocation;
uniform vec4 uSelection;
uniform vec2 gameWH;
uniform vec4 uBorder;
uniform vec4 uColor;


bool inBounds(float x, float y, float width, float height, float touchX, float touchY) {
    return (touchX > x &&
      touchX < x + width &&
      touchY > y &&
      touchY < y + height);
  }

void main(void) {
    vec4 texel = vec4(0.,0.,0.,0.);
    vec2 mapdCoord   = currCoord.xy*vec2(gameWH.x,-gameWH.y);
    vec4 mapdSel = (uSelection * vec4(2.)) - vec4(gameWH.x,gameWH.y,0.,0.);
    if(uBorder.y != 0.){
        float muBorder = uBorder.x;
        if(uBorder.y==1. && (
            (mapdCoord.x < mapdSel.x + muBorder   && mapdCoord.x > mapdSel.x               && mod(mapdCoord.y,uBorder.z+uBorder.w)>uBorder.z)  ||
            (mapdCoord.y < mapdSel.y + muBorder   && mapdCoord.y > mapdSel.y               && mod(mapdCoord.x,uBorder.z+uBorder.w)>uBorder.z)  ||
            (mapdCoord.x < mapdSel.z + mapdSel.x && mapdCoord.x > mapdSel.z + mapdSel.x - muBorder  && mod(mapdCoord.y,uBorder.z+uBorder.w)>uBorder.z)  ||
            (mapdCoord.y < mapdSel.w + mapdSel.y && mapdCoord.y > mapdSel.w + mapdSel.y - muBorder  && mod(mapdCoord.x,uBorder.z+uBorder.w)>uBorder.z)
            ) && 
            inBounds(mapdSel.x,
                     mapdSel.y, 
                     mapdSel.z, 
                     mapdSel.w, 
                     mapdCoord.x, 
                     mapdCoord.y)){
                texel = uColor;
            }
        else if(uBorder.y == 2.){ 
            // muBorder = muBorder / 2.;

            if ((
            (mapdCoord.x - mapdSel.x< muBorder   && mod(mapdCoord.y,uBorder.z+uBorder.w)>uBorder.z) 
            //  ||
            // (mapdCoord.y < mapdSel.y + muBorder            && mapdCoord.y > mapdSel.y - muBorder   && mod(mapdCoord.x,uBorder.z+uBorder.w)>uBorder.z)  ||
            // (mapdCoord.x < mapdSel.z + mapdSel.x+ muBorder && mapdCoord.x > mapdSel.z + mapdSel.x - muBorder && mod(mapdCoord.y,uBorder.z+uBorder.w)>uBorder.z)  ||
            // (mapdCoord.y < mapdSel.w + mapdSel.y+ muBorder && mapdCoord.y > mapdSel.w + mapdSel.y - muBorder && mod(mapdCoord.x,uBorder.z+uBorder.w)>uBorder.z)
            ) 
            // && 
            // inBounds(mapdSel.x-muBorder,
            //          mapdSel.y-muBorder, 
            //          mapdSel.z+muBorder, 
            //          mapdSel.w+muBorder, 
            //          mapdCoord.x, 
            //          mapdCoord.y)
                     ){
                texel = uColor;
        }
        else if(uBorder.y > 2.&& (
            (mapdCoord.x < mapdSel.x                      && mapdCoord.x > mapdSel.x - muBorder   && mod(mapdCoord.y,uBorder.z+uBorder.w)>uBorder.z)  ||
            (mapdCoord.y < mapdSel.y                      && mapdCoord.y > mapdSel.y - muBorder   && mod(mapdCoord.x,uBorder.z+uBorder.w)>uBorder.z)  ||
            (mapdCoord.x < mapdSel.z + mapdSel.x+ muBorder && mapdCoord.x > mapdSel.z + mapdSel.x && mod(mapdCoord.y,uBorder.z+uBorder.w)>uBorder.z)  ||
            (mapdCoord.y < mapdSel.w + mapdSel.y+ muBorder && mapdCoord.y > mapdSel.w + mapdSel.y && mod(mapdCoord.x,uBorder.z+uBorder.w)>uBorder.z)
            ) && 
            inBounds(mapdSel.x-muBorder,
                     mapdSel.y-muBorder, 
                     mapdSel.z+muBorder*2., 
                     mapdSel.w+muBorder*2., 
                     mapdCoord.x, 
                     mapdCoord.y)){
                texel = uColor;
            }
        }
    gl_FragColor = texel;
    }
}


