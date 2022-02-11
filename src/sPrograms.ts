import * as T from './utils/cells/type'
import Render from './render'


export default class ShaderProgramsHelper extends Render{

  /**
   * Gives properties to the batch as this application first used
   * @param batch 
   * @param program must use `aVertexPosition, texcoordLocation`, `matrixLocation`, `textureMatrixLocation` and `textureLocation` variables.
   * See main.frag and main.vert
   * @returns a batch with classic properties
   */
  public static createClassicBatch(aRenderables: {[layer:number]: Array<T.npc>}, program: WebGLProgram): T.renderableBatch{
    let batch: T.renderableBatch = {
      clampToBorder: true,
      r: aRenderables,
      shader: {
      program: program,
      properties: {
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
    },
    passes : {
      0:{
        fnct: (self: T.renderableBatch, layer: number, currentRenderable: T.npc, targetWidth: number, targetHeight: number) => {
          let aVertexPosition = Render.getContext().getAttribLocation(self.shader.program, "aVertexPosition");
          Render.getContext().enableVertexAttribArray(aVertexPosition);
          Render.getContext().vertexAttribPointer(aVertexPosition, 2, Render.getContext().FLOAT, false, 0, 0);
        }
      },
      1:{
        fnct: (self: T.renderableBatch, layer: number, currentRenderable: T.npc, targetWidth: number, targetHeight: number) => {
          let texCoordLocation = Render.getContext().getAttribLocation(self.shader.program, "texcoordLocation");
          Render.getContext().enableVertexAttribArray(texCoordLocation);
          Render.getContext().vertexAttribPointer(texCoordLocation, 2, Render.getContext().FLOAT, false, 0, 0);
        }
      },
      2:{
        fnct: (self: T.renderableBatch, layer: number, currentRenderable: T.npc, targetWidth: number, targetHeight: number) => {
          let matrixLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(self.shader.program, "matrixLocation");
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
      },
      3:{
        fnct: (self: T.renderableBatch, layer: number, currentRenderable: T.npc, targetWidth: number, targetHeight: number) => {
          let textureMatrixLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(self.shader.program, "textureMatrixLocation");
          let texMatrix = Render.Matrix.orthographic(0, 2, 2, 0, 1, 0)
          texMatrix = Render.Matrix.translate(texMatrix, 1, 1, 0)
          // texMatrix = Render.Matrix.scale(texMatrix, currentRenderable.scale[0], currentRenderable.scale[1], 1)
          Render.getContext().uniformMatrix4fv(textureMatrixLocation, false, texMatrix);
        }
      },
      4:{
        fnct: (self: T.renderableBatch, layer: number, currentRenderable: T.npc, targetWidth: number, targetHeight: number) => {
          // let textureLocation : WebGLUniformLocation = Render.getContext().getUniformLocation(self.shader.program, "textureLocation");
          // Render.getContext().uniform1i(textureLocation, 0);
        }
      }
    }
    }
    return batch
  }
}