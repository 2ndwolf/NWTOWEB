import * as T from './utils/cells/type'
import Render from './render'

import Globals from './globals'


export class DefaultShaders {
  public static initShaders() {
    new fallbackShader(Globals.fallbackShader).compile()
  }
}

export class fallbackShader {
  private id : string = ''

    constructor(id:string){
      this.id = id
    }
    
    public compile() : void {
      Render.addShader(this.id, Render.createShader(
        this.vertex, this.fragment,
        this.properties, this.passes))
    }

    public vertex: string = 
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

    public fragment: string =
    `
    precision mediump float;
        
    varying vec2 v_texcoord;
    
    uniform sampler2D textureLocation;
    
    void main(void) {
        gl_FragColor = texture2D(textureLocation, v_texcoord * (1.,-1.));
    }
    `

    public properties = {
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

    public passes : Array<T.shaderPass> = [
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let aVertexPosition = Render.getContext().getAttribLocation(shader.program, "aVertexPosition");
        Render.getContext().enableVertexAttribArray(aVertexPosition);
        Render.getContext().vertexAttribPointer(aVertexPosition, 2, Render.getContext().FLOAT, false, 0, 0);
      }
      ,
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let texCoordLocation = Render.getContext().getAttribLocation(shader.program, "texcoordLocation");
        Render.getContext().enableVertexAttribArray(texCoordLocation);
        Render.getContext().vertexAttribPointer(texCoordLocation, 2, Render.getContext().FLOAT, false, 0, 0);
      }
      ,
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let matrixLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(shader.program, "matrixLocation");
        let matrix = Render.Matrix.orthographic(0, 
        targetWidth/
        currentRenderable.texture.width,
        // currentRenderable.texture.width/
          targetHeight/
          currentRenderable.texture.height,
          0, 1, 0)
          
        const scale = currentRenderable.scale || [1.,1.]

        matrix = Render.Matrix.translate(matrix, currentRenderable.x/currentRenderable.texture.width, currentRenderable.y/currentRenderable.texture.height,0)
        matrix = Render.Matrix.scale(matrix, scale[0], scale[1], 1)
        Render.getContext().uniformMatrix4fv(matrixLocation, false, matrix);
      }
      ,
      (self: T.renderableBatch, layer: T.Layer, currentRenderable: T.gameobject, targetWidth: number, targetHeight: number, shader: T.Shader) => {
        let textureMatrixLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(shader.program, "textureMatrixLocation");
        let texMatrix = Render.Matrix.orthographic(0, 2, 2, 0, 1, 0)
        texMatrix = Render.Matrix.translate(texMatrix, 1, 1, 0)
        // texMatrix = Render.Matrix.scale(texMatrix, currentRenderable.scale[0], currentRenderable.scale[1], 1)
        Render.getContext().uniformMatrix4fv(textureMatrixLocation, false, texMatrix);
      }
    ]

}