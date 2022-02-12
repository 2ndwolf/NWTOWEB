attribute vec2 aVertexPosition;
attribute vec2 texcoordLocation;

uniform mat4 matrixLocation;
uniform mat4 textureMatrixLocation;

varying vec2 v_texcoord;

void main() {
    gl_Position = matrixLocation * vec4(aVertexPosition,0.,1.);
    v_texcoord = (textureMatrixLocation *  vec4(texcoordLocation*vec2(-1.,1.), 0, 1)).xy;
}