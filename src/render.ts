import {cellTile} from "./utils/cells/type"
import {LevelTypes} from "./utils/cells/type"
import Assets from "./assets"

import Globals from "./globals"

let gameWidth = () => {
  return Globals.getGameWidth()
}
let gameHeight = () => {
  return Globals.getGameHeight()
}

export class Render {
  public static gl: WebGLRenderingContext = ((): WebGLRenderingContext => {
    document.querySelector("body").appendChild(
      ((): Node => {
        let cnvs = document.createElement("canvas")
        cnvs.setAttribute("width", gameWidth().toString())
        cnvs.setAttribute("height", gameHeight().toString())
        return cnvs
      })())
  
    return document.querySelector("canvas").getContext("webgl")
  })()

  private static shaders: { [id: string] : WebGLProgram} = {}

  public static main(): void {
    let vertexShaderSource = document.getElementById("tex-vertex-shader").textContent
    let fragmentShaderSource = document.getElementById("tex-fragment-shader").textContent

    Render.GLSLinterpreter.createShader("mainShader", vertexShaderSource, fragmentShaderSource)
  }

  public static renderALevel(aCellTile: Array<cellTile>, tileSize: number, cellTileWH: number): void {
    let textureLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "textureLocation");
    let textureMatrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "textureMatrixLocation");
    let matrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "matrixLocation");
    let texCoordLocation = Render.gl.getAttribLocation(Render.shaders['mainShader'], "texcoordLocation");


    Render.gl.clearColor(0, 0.5, 0, 1);
    Render.gl.clear(Render.gl.COLOR_BUFFER_BIT);

    let img : HTMLImageElement = Assets.getImage('tileset') as HTMLImageElement
    let tileTex : WebGLTexture = Render.createTexToBlitOn(img.width,img.height)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, tileTex)
    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0, Render.gl.RGBA, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, img)

    const framebuffer = Render.gl.createFramebuffer()
    Render.gl.bindFramebuffer(Render.gl.FRAMEBUFFER, framebuffer)
    
    let cellTex : WebGLTexture = Render.createTexToBlitOn(tileSize*cellTileWH,tileSize*cellTileWH)
    Render.gl.framebufferTexture2D(Render.gl.FRAMEBUFFER, Render.gl.COLOR_ATTACHMENT0, Render.gl.TEXTURE_2D, tileTex, 0)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, cellTex)
    
    for(let i = 0; i < aCellTile.length; i++){
      Render.gl.copyTexSubImage2D(Render.gl.TEXTURE_2D, 0,
        (i%cellTileWH) * tileSize, Math.floor(i/cellTileWH) * tileSize, aCellTile[i]['frameX'], aCellTile[i]['frameY'],tileSize,tileSize)
        // Math.round((i%cellTileWH) / tileSize), Math.round((i / cellTileWH) / tileSize), aCellTile[i]['frameX'], aCellTile[i]['frameY'],tileSize,tileSize)
      }
    Render.gl.deleteFramebuffer(framebuffer)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, cellTex)

    var aspect = Render.gl.canvas.width / Render.gl.canvas.height;

    let positions = new Float32Array([
      -1, 1, 1, 1, 1,-1, // Triangle 1
      -1, 1, 1,-1, -1,-1 // Triangle 2
    ]);;

    let vbuffer = Render.gl.createBuffer();
    Render.gl.bindBuffer(Render.gl.ARRAY_BUFFER, vbuffer);
    Render.gl.bufferData(Render.gl.ARRAY_BUFFER, positions, Render.gl.STATIC_DRAW);

    let itemSize = 2;
    let numItems = positions.length / itemSize;

    Render.gl.useProgram(Render.shaders['mainShader']);
    
    let aVertexPosition = Render.gl.getAttribLocation(Render.shaders['mainShader'], "aVertexPosition");
    Render.gl.enableVertexAttribArray(aVertexPosition);
    Render.gl.vertexAttribPointer(aVertexPosition, itemSize, Render.gl.FLOAT, false, 0, 0);

    Render.gl.enableVertexAttribArray(texCoordLocation);
    Render.gl.vertexAttribPointer(texCoordLocation, itemSize, Render.gl.FLOAT, false, 0, 0);

    let matrix = Render.Matrix.orthographic(0, 1, 1, 0, 1, 0)
    matrix = Render.Matrix.scale(matrix, 1, 1, 1);
    matrix = Render.Matrix.translate(matrix,0,0,0)
    Render.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    
    let texMatrix = Render.Matrix.orthographic(0, 2, 2, 0, 1, 0)
    texMatrix = Render.Matrix.scale(texMatrix, 1, 1, 1)
    texMatrix = Render.Matrix.translate(texMatrix,0,1,0)
    Render.gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);

    Render.gl.uniform1i(textureLocation, 0);

    Render.gl.drawArrays(Render.gl.TRIANGLES, 0, numItems);
  }




  private static createTexToBlitOn(width: number, height: number): WebGLTexture {
    const targetTexture = Render.gl.createTexture()
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, targetTexture);
    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0,  Render.gl.RGBA, 
                          width, height, 
                          0, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE,
                          null)

    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_MIN_FILTER, Render.gl.LINEAR)
    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_WRAP_S, Render.gl.CLAMP_TO_EDGE)
    Render.gl.texParameteri(Render.gl.TEXTURE_2D, Render.gl.TEXTURE_WRAP_T, Render.gl.CLAMP_TO_EDGE)
    return targetTexture;
  }

  // private static setFramebuffer(fbo, width, height) {
  //   // make this the framebuffer we are rendering to.
  //   Render.gl.bindFramebuffer(Render.gl.FRAMEBUFFER, fbo);

  //   // Tell the shader the resolution of the framebuffer.
  //   Render.gl.uniform2f(resolutionLocation, width, height);

  //   // Tell webgl the viewport setting needed for framebuffer.
  //   Render.gl.viewport(0, 0, width, height);
  // }

  private static GLSLinterpreter = class {

    // public
    static createShader(shaderID: string, vertexSource: string, fragmentSource: string): void{    
      let vertexShader = Render.GLSLinterpreter.compileShader(Render.gl.VERTEX_SHADER, vertexSource)
      let fragmentShader = Render.GLSLinterpreter.compileShader(Render.gl.FRAGMENT_SHADER, fragmentSource)
      Render.shaders[shaderID] = Render.GLSLinterpreter.createProgram(vertexShader, fragmentShader)
    }

    // private
    static compileShader(type, source): WebGLShader {
      let shader = Render.gl.createShader(type)
      Render.gl.shaderSource(shader, source)
      Render.gl.compileShader(shader)
      let success: boolean = Render.gl.getShaderParameter(shader, Render.gl.COMPILE_STATUS)
      if (success) return shader
    
      console.debug(Render.gl.getShaderInfoLog(shader))
      Render.gl.deleteShader(shader)
    }

    // private
    static createProgram(vertexShader, fragmentShader): WebGLProgram {
      let program = Render.gl.createProgram()
      Render.gl.attachShader(program, vertexShader)
      Render.gl.attachShader(program, fragmentShader)
      Render.gl.linkProgram(program)
      let success = Render.gl.getProgramParameter(program, Render.gl.LINK_STATUS)
      if (success) return program
    
      console.debug(Render.gl.getProgramInfoLog(program))
      Render.gl.deleteProgram(program)
    }

  }

  private static Matrix = class {
    static orthographic(left, right, bottom, top, near, far, dst = new Float32Array(16)) {
  
      dst[ 0] = 2 / (right - left);
      dst[ 1] = 0;
      dst[ 2] = 0;
      dst[ 3] = 0;
      dst[ 4] = 0;
      dst[ 5] = 2 / (top - bottom);
      dst[ 6] = 0;
      dst[ 7] = 0;
      dst[ 8] = 0;
      dst[ 9] = 0;
      dst[10] = 2 / (near - far);
      dst[11] = 0;
      dst[12] = (left + right) / (left - right);
      dst[13] = (bottom + top) / (bottom - top);
      dst[14] = (near + far) / (near - far);
      dst[15] = 1;
  
      return dst;
    }

    static scale(m, sx, sy, sz, dst = new Float32Array(16)) {
      // This is the optimized version of
      // return multiply(m, scaling(sx, sy, sz), dst);
  
      dst[ 0] = sx * m[0 * 4 + 0];
      dst[ 1] = sx * m[0 * 4 + 1];
      dst[ 2] = sx * m[0 * 4 + 2];
      dst[ 3] = sx * m[0 * 4 + 3];
      dst[ 4] = sy * m[1 * 4 + 0];
      dst[ 5] = sy * m[1 * 4 + 1];
      dst[ 6] = sy * m[1 * 4 + 2];
      dst[ 7] = sy * m[1 * 4 + 3];
      dst[ 8] = sz * m[2 * 4 + 0];
      dst[ 9] = sz * m[2 * 4 + 1];
      dst[10] = sz * m[2 * 4 + 2];
      dst[11] = sz * m[2 * 4 + 3];
  
      if (m !== dst) {
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }
  
      return dst;
    }
  
    static translate(m, tx, ty, tz, dst = new Float32Array(16)) {
      // This is the optimized version of
      // return multiply(m, translation(tx, ty, tz), dst);
  
      var m00 = m[0];
      var m01 = m[1];
      var m02 = m[2];
      var m03 = m[3];
      var m10 = m[1 * 4 + 0];
      var m11 = m[1 * 4 + 1];
      var m12 = m[1 * 4 + 2];
      var m13 = m[1 * 4 + 3];
      var m20 = m[2 * 4 + 0];
      var m21 = m[2 * 4 + 1];
      var m22 = m[2 * 4 + 2];
      var m23 = m[2 * 4 + 3];
      var m30 = m[3 * 4 + 0];
      var m31 = m[3 * 4 + 1];
      var m32 = m[3 * 4 + 2];
      var m33 = m[3 * 4 + 3];
  
      if (m !== dst) {
        dst[ 0] = m00;
        dst[ 1] = m01;
        dst[ 2] = m02;
        dst[ 3] = m03;
        dst[ 4] = m10;
        dst[ 5] = m11;
        dst[ 6] = m12;
        dst[ 7] = m13;
        dst[ 8] = m20;
        dst[ 9] = m21;
        dst[10] = m22;
        dst[11] = m23;
      }
  
      dst[12] = m00 * tx + m10 * ty + m20 * tz + m30;
      dst[13] = m01 * tx + m11 * ty + m21 * tz + m31;
      dst[14] = m02 * tx + m12 * ty + m22 * tz + m32;
      dst[15] = m03 * tx + m13 * ty + m23 * tz + m33;
  
      return dst;
    }
  }
}

export default Render
