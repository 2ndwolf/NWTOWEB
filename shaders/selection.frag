
precision mediump float;

varying vec2 v_texcoord;
varying vec4 currCoord;
// out gl_PerVertex { vec4 gl_Position; };

uniform sampler2D textureLocation;
uniform vec4 selection;
uniform vec2 gameWH;
uniform vec4 border;
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
    vec4 mapdSel = (selection * vec4(2.)) - vec4(gameWH.x,gameWH.y,0.,0.);
    if(border.y != 0.){
        float mBorder = border.x;
        if(border.y==1. && (
            (mapdCoord.x < mapdSel.x + mBorder   && mapdCoord.x > mapdSel.x               && mod(mapdCoord.y,border.z+border.w)>border.z)  ||
            (mapdCoord.y < mapdSel.y + mBorder   && mapdCoord.y > mapdSel.y               && mod(mapdCoord.x,border.z+border.w)>border.z)  ||
            (mapdCoord.x < mapdSel.z + mapdSel.x && mapdCoord.x > mapdSel.z + mapdSel.x - mBorder  && mod(mapdCoord.y,border.z+border.w)>border.z)  ||
            (mapdCoord.y < mapdSel.w + mapdSel.y && mapdCoord.y > mapdSel.w + mapdSel.y - mBorder  && mod(mapdCoord.x,border.z+border.w)>border.z)
            ) && 
            inBounds(mapdSel.x,
                     mapdSel.y, 
                     mapdSel.z, 
                     mapdSel.w, 
                     mapdCoord.x, 
                     mapdCoord.y)){
                texel = uColor;
            }
        else if(border.y == 2.){ 
            // mBorder = mBorder / 2.;

            if ((
            (mapdCoord.x - mapdSel.x< mBorder   && mod(mapdCoord.y,border.z+border.w)>border.z) 
            //  ||
            // (mapdCoord.y < mapdSel.y + mBorder            && mapdCoord.y > mapdSel.y - mBorder   && mod(mapdCoord.x,border.z+border.w)>border.z)  ||
            // (mapdCoord.x < mapdSel.z + mapdSel.x+ mBorder && mapdCoord.x > mapdSel.z + mapdSel.x - mBorder && mod(mapdCoord.y,border.z+border.w)>border.z)  ||
            // (mapdCoord.y < mapdSel.w + mapdSel.y+ mBorder && mapdCoord.y > mapdSel.w + mapdSel.y - mBorder && mod(mapdCoord.x,border.z+border.w)>border.z)
            ) 
            // && 
            // inBounds(mapdSel.x-mBorder,
            //          mapdSel.y-mBorder, 
            //          mapdSel.z+mBorder, 
            //          mapdSel.w+mBorder, 
            //          mapdCoord.x, 
            //          mapdCoord.y)
                     ){
                texel = uColor;
        }
        else if(border.y > 2.&& (
            (mapdCoord.x < mapdSel.x                      && mapdCoord.x > mapdSel.x - mBorder   && mod(mapdCoord.y,border.z+border.w)>border.z)  ||
            (mapdCoord.y < mapdSel.y                      && mapdCoord.y > mapdSel.y - mBorder   && mod(mapdCoord.x,border.z+border.w)>border.z)  ||
            (mapdCoord.x < mapdSel.z + mapdSel.x+ mBorder && mapdCoord.x > mapdSel.z + mapdSel.x && mod(mapdCoord.y,border.z+border.w)>border.z)  ||
            (mapdCoord.y < mapdSel.w + mapdSel.y+ mBorder && mapdCoord.y > mapdSel.w + mapdSel.y && mod(mapdCoord.x,border.z+border.w)>border.z)
            ) && 
            inBounds(mapdSel.x-mBorder,
                     mapdSel.y-mBorder, 
                     mapdSel.z+mBorder*2., 
                     mapdSel.w+mBorder*2., 
                     mapdCoord.x, 
                     mapdCoord.y)){
                texel = uColor;
            }
        }
    gl_FragColor = texel;
    }
}


