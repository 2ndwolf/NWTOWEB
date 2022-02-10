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
  public static createClassicBatch(aRenderables: {[layer:number]: Array<T.renderableWProps>}, program: WebGLProgram): T.renderableBatch{
    let batch: T.renderableBatch = {
      r: aRenderables,
      shader: {
      program: program,
      properties: {
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
        fnct: (self: T.renderableBatch) => {
          let aVertexPosition = Render.gl.getAttribLocation(self.shader.program, "aVertexPosition");
          Render.gl.enableVertexAttribArray(aVertexPosition);
          Render.gl.vertexAttribPointer(aVertexPosition, 2, Render.gl.FLOAT, false, 0, 0);
        }
      },
      1:{
        fnct: (self: T.renderableBatch) => {
          let texCoordLocation = Render.gl.getAttribLocation(self.shader.program, "texcoordLocation");
          Render.gl.enableVertexAttribArray(texCoordLocation);
          Render.gl.vertexAttribPointer(texCoordLocation, 2, Render.gl.FLOAT, false, 0, 0);
        }
      },
      2:{
        fnct: (self: T.renderableBatch) => {
          let matrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(self.shader.program, "matrixLocation");
          let matrix = Render.Matrix.orthographic(0, 1, 1, 0, 1, 0)
          matrix = Render.Matrix.scale(matrix, 1, 1, 1);
          matrix = Render.Matrix.translate(matrix,0,0,0)
          Render.gl.uniformMatrix4fv(matrixLocation, false, matrix);
        }
      },
      3:{
        fnct: (self: T.renderableBatch) => {
          let textureMatrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(self.shader.program, "textureMatrixLocation");
          let texMatrix = Render.Matrix.orthographic(0, 2, 2, 0, 1, 0)
          texMatrix = Render.Matrix.scale(texMatrix, 1, 1, 1)
          texMatrix = Render.Matrix.translate(texMatrix,0,1,0)
          Render.gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);
        }
      },
      4:{
        fnct: (self: T.renderableBatch) => {
          let textureLocation : WebGLUniformLocation = Render.gl.getUniformLocation(self.shader.program, "textureLocation");
          Render.gl.uniform1i(textureLocation, 0);
        }
      }
    }
    }
    return batch
  }
}