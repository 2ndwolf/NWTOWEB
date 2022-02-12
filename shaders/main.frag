precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D textureLocation;

void main(void) {
    gl_FragColor = texture2D(textureLocation, v_texcoord * (1.,-1.));
}