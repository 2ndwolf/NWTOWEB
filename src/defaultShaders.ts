import * as T from './utils/cells/type'
import Render from './render'


export default class DefaultShaders {
  private static toPush : {[name:string]:T.Shader} = {}

  public static initShaders() {
    DefaultShaders.fallbackShader?.init()
    for(const s in DefaultShaders.toPush){
      Render.addShader(s, DefaultShaders.toPush[s])
    }
  }

  private static fallbackShader = class {
    public static init() : void {
      DefaultShaders.toPush['fallbackShader'] = Render.createShader(
        DefaultShaders.fallbackShader.vertex, DefaultShaders.fallbackShader.fragment,
        DefaultShaders.fallbackShader.properties, DefaultShaders.fallbackShader.passes)
    }

    private static vertex: string = 
    `
    attribute vec2 aVertexPosition;
    attribute vec2 texcoordLocation;

    uniform mat4 matrixLocation;
    uniform mat4 textureMatrixLocation;

    varying vec2 v_texcoord;

    void main() {
        gl_Position = matrixLocation * vec4(aVertexPosition,0.,1.);
        v_texcoord = (textureMatrixLocation *  vec4(texcoordLocation*vec2(-1.,1.), 0, 1)).xy;
    }
    `

    private static fragment: string =
    `
    precision mediump float;
        
    varying vec2 v_texcoord;
    
    uniform sampler2D textureLocation;
    
    void main(void) {
        gl_FragColor = texture2D(textureLocation, v_texcoord * (1.,-1.));
    }
    `

    private static properties = {
      aVertexPosition:{
        propType: T.shaderPropTypes.attribute,
        data: new Float32Array()
      },
      textureLocation: {
        propType: T.shaderPropTypes.uniform,
        data: new Float32Array()
      },
      textureMatrixLocation:{
        propType: T.shaderPropTypes.uniform,
        data: new Float32Array()
      },
      matrixLocation:{
        propType: T.shaderPropTypes.uniform,
        data: new Float32Array()
      },
      texCoordLocation:{
        propType: T.shaderPropTypes.attribute,
        data: new Float32Array()
      }
    }

    private static passes = {
      0:
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let aVertexPosition = Render.getContext().getAttribLocation(shader.program, "aVertexPosition");
        Render.getContext().enableVertexAttribArray(aVertexPosition);
        Render.getContext().vertexAttribPointer(aVertexPosition, 2, Render.getContext().FLOAT, false, 0, 0);
      }
      ,
      1:
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let texCoordLocation = Render.getContext().getAttribLocation(shader.program, "texcoordLocation");
        Render.getContext().enableVertexAttribArray(texCoordLocation);
        Render.getContext().vertexAttribPointer(texCoordLocation, 2, Render.getContext().FLOAT, false, 0, 0);
      }
      ,
      2:
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let matrixLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(shader.program, "matrixLocation");
        let matrix = Render.Matrix.orthographic(0, 
        targetWidth/
        currentRenderable.texture.width,
        // currentRenderable.texture.width/
          targetHeight/
          currentRenderable.texture.height,
          0, 1, 0)
          
        matrix = Render.Matrix.translate(matrix, currentRenderable.x/currentRenderable.texture.width, currentRenderable.y/currentRenderable.texture.height,0)
        matrix = Render.Matrix.scale(matrix, currentRenderable.scale[0], currentRenderable.scale[1], 1)
        Render.getContext().uniformMatrix4fv(matrixLocation, false, matrix);
      }
      ,
      3:
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let textureMatrixLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(shader.program, "textureMatrixLocation");
        let texMatrix = Render.Matrix.orthographic(0, 2, 2, 0, 1, 0)
        texMatrix = Render.Matrix.translate(texMatrix, 1, 1, 0)
        // texMatrix = Render.Matrix.scale(texMatrix, currentRenderable.scale[0], currentRenderable.scale[1], 1)
        Render.getContext().uniformMatrix4fv(textureMatrixLocation, false, texMatrix);
      }
      ,
      4:
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        // let textureLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(shader.program, "textureLocation");
        // Render.getContext().uniform1i(textureLocation, 0);
      }
        
      }
  }

}