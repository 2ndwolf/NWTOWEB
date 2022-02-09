import cellTile from "./utils/cells/type"
import Assets from "./assets"


var gameWidth = 1024;
var gameHeight = 1024;

export class Render {
  public static gl: WebGLRenderingContext = ((): WebGLRenderingContext => {
    document.querySelector("body").appendChild(
      ((): Node => {
        let cnvs = document.createElement("canvas")
        cnvs.setAttribute("width", gameWidth.toString())
        cnvs.setAttribute("height", gameHeight.toString())
        return cnvs
      })())
  
    return document.querySelector("canvas").getContext("webgl")
  })()

  private static shaders: { [id: string] : WebGLProgram} = {}

  public static main(): void {
    let vertexShaderSource = document.getElementById("tex-vertex-shader").textContent
    let fragmentShaderSource = document.getElementById("tex-fragment-shader").textContent

    Render.GLSLinterpreter.createShader("mainShader", vertexShaderSource, fragmentShaderSource)
    console.log(this.shaders);
  }

  private static orthographic(left, right, bottom, top, near, far, dst = new Float32Array(16)) {
    dst = dst;

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

  public static renderASquare(aCellTile: Array<cellTile>): void {
    let textureLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "textureLocation");
    let textureMatrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "textureMatrixLocation");
    let matrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "matrixLocation");
    let texCoordLocation = Render.gl.getAttribLocation(Render.shaders['mainShader'], "texcoordLocation");


    Render.gl.clearColor(0, 0.5, 0, 1);
    Render.gl.clear(Render.gl.COLOR_BUFFER_BIT);

    let img : HTMLImageElement = Assets.getImage('tileset') as HTMLImageElement
    let tileTex : WebGLTexture = Render.createTexToBlitOn(2048,512)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, tileTex)
    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0, Render.gl.RGBA, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, img)

    const framebuffer = Render.gl.createFramebuffer()
    Render.gl.bindFramebuffer(Render.gl.FRAMEBUFFER, framebuffer)
    
    let cellTex : WebGLTexture = Render.createTexToBlitOn(gameWidth,gameHeight)
    Render.gl.framebufferTexture2D(Render.gl.FRAMEBUFFER, Render.gl.COLOR_ATTACHMENT0, Render.gl.TEXTURE_2D, tileTex, 0)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, cellTex)
    
    for(let i = 0; i < aCellTile.length / 2; i++){
      // Render.gl.texSubImage2D(gl.TEXTURE_2D, 0, destX, destY, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, cellTex);
      Render.gl.copyTexSubImage2D(Render.gl.TEXTURE_2D, 0, 

        (i%64) << 4, (i >> 6) << 4, aCellTile[i]['frameX'], aCellTile[i]['frameY'],16,16)

        // (i%64) << 4, (i >> 6) << 4, aCellTile[i << 1]['frameX'], aCellTile[(i << 1) +1]['frameY'],16,16)
      }
      // Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0, Render.gl.RGBA, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, cellTex)
      Render.gl.deleteFramebuffer(framebuffer)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, cellTex)

    // console.log(Render.gl.getParameter(Render.gl.TEXTURE_BINDING_2D))
    // Render.gl.bindTexture(Render.gl.TEXTURE_2D, Assets.getImage('tileset'));

    var aspect = Render.gl.canvas.width / Render.gl.canvas.height;

    // Fill the view
    let positions = new Float32Array([
      -1, 1, 1, 1, 1,-1, // Triangle 1
      -1, 1, 1,-1, -1,-1 // Triangle 2
      // 1, -1, -1, -1, -1, 1, // Triangle 1
      // 1, -1, -1,  1,  1, 1 // Triangle 2
    ]);;

    // let positions = new Float32Array([0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1])

    let vbuffer = Render.gl.createBuffer();
    Render.gl.bindBuffer(Render.gl.ARRAY_BUFFER, vbuffer);
    Render.gl.bufferData(Render.gl.ARRAY_BUFFER, new Float32Array(positions), Render.gl.STATIC_DRAW);

    let itemSize = 2;
    let numItems = positions.length / itemSize;

    Render.gl.useProgram(Render.shaders['mainShader']);

    // let uColor = Render.gl.getUniformLocation(Render.shaders['mainShader'], "uColor");
    // Render.gl.uniform4fv(uColor, [0.0, 0.3, 0.0, 1.0]);
    
    let aVertexPosition = Render.gl.getAttribLocation(Render.shaders['mainShader'], "aVertexPosition");
    Render.gl.enableVertexAttribArray(aVertexPosition);
    Render.gl.vertexAttribPointer(aVertexPosition, itemSize, Render.gl.FLOAT, false, 0, 0);

    Render.gl.enableVertexAttribArray(texCoordLocation);
    Render.gl.vertexAttribPointer(texCoordLocation, itemSize, Render.gl.FLOAT, false, 0, 0);

    // Render.gl.viewport(0, -1, Render.gl.canvas.width, Render.gl.canvas.height);

    let matrix = Render.orthographic(0, 1, 1, 0, 1, 0)
    matrix = Render.scale(matrix, 1, 1, 1);
    // matrix = Render.translate(matrix,0,0,0)
    Render.gl.uniformMatrix4fv(matrixLocation, false, matrix);
    
    let texMatrix = Render.orthographic(0, 2, 2, 0, 1, 0)
    // texMatrix = Render.scale(texMatrix, 1, 1 , 1)
    texMatrix = Render.translate(texMatrix,0,1,0)
    Render.gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);

    Render.gl.uniform1i(textureLocation, 0);

    Render.gl.drawArrays(Render.gl.TRIANGLES, 0, numItems);
  }

  private static scale(m, sx, sy, sz, dst = new Float32Array(16)) {
    // This is the optimized version of
    // return multiply(m, scaling(sx, sy, sz), dst);
    // dst = dst;

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

  public static translate(m, tx, ty, tz, dst = new Float32Array(16)) {
    // This is the optimized version of
    // return multiply(m, translation(tx, ty, tz), dst);
    // dst = dst || new Float32Array(16);

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

  public static renderALevel(aCellTile: Array<cellTile>): void {
    let img : HTMLImageElement = Assets.getImage('tileset') as HTMLImageElement
    let tileTex : WebGLTexture = Render.createTexToBlitOn(2048,512)
    Render.gl.bindTexture(Render.gl.TEXTURE_2D, tileTex)
    Render.gl.texImage2D(Render.gl.TEXTURE_2D, 0, Render.gl.RGBA, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, img)

    // Render.gl.viewport(0, 0, Render.gl.canvas.width, Render.gl.canvas.height);
    // const framebuffer = Render.gl.createFramebuffer()
    // Render.gl.bindFramebuffer(Render.gl.FRAMEBUFFER, framebuffer)

    // let cellTex : WebGLTexture = Render.createTexToBlitOn(gameWidth,gameHeight)
    // Render.gl.framebufferTexture2D(Render.gl.FRAMEBUFFER, Render.gl.COLOR_ATTACHMENT0, Render.gl.TEXTURE_2D, cellTex, 0)
    // Render.gl.bindTexture(Render.gl.TEXTURE_2D, tileTex)

    Render.gl.useProgram(Render.shaders['mainShader'])
    
    // for(let i = 0; i < aCellTile.length >> 1; i++){
    //   // Render.gl.texSubImage2D(gl.TEXTURE_2D, 0, destX, destY, Render.gl.RGBA, Render.gl.UNSIGNED_BYTE, cellTex);
    //   Render.gl.copyTexSubImage2D(Render.gl.TEXTURE_2D, 0, (i%64) << 4, (i >> 6) << 4, aCellTile[i << 1]['frameX'], aCellTile[(i << 1) +1]['frameY'],16,16)
    // }

    let positionLocation = Render.gl.getAttribLocation(Render.shaders['mainShader'], "positionLocation");
    // let texCoordLocation = Render.gl.getAttribLocation(Render.shaders['mainShader'], "texcoordLocation");
    let matrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "matrixLocation");
    // let texMatrixLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "textureMatrixLocation");
    // let textureLocation : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "textureLocation");
    // Render.gl.enableVertexAttribArray(positionLocation);

    // texPositionBuffer = await GL.CreateBufferAsync();
    // await GL.BindBufferAsync(BufferType.ARRAY_BUFFER, texPositionBuffer);
    
    // texcoordBuffer = await GL.CreateBufferAsync();
    // await GL.BindBufferAsync(BufferType.ARRAY_BUFFER, texcoordBuffer);
    // float[] texcoords = {0f, 0f, 0f, 1f, 1f, 0f, 1f, 0f, 0f, 1f, 1f, 1f};
    // await GL.BufferDataAsync(BufferType.ARRAY_BUFFER, texcoords, BufferUsageHint.STATIC_DRAW);
    
    
    // Render.gl.enableVertexAttribArray(positionLocation);
    // Render.gl.bindFramebuffer(Render.gl.FRAMEBUFFER, null)
    // Render.gl.bindTexture(Render.gl.TEXTURE_2D, tileTex);

    // let texPosBuf = Render.gl.createBuffer()
    // Render.gl.bindBuffer(Render.gl.ARRAY_BUFFER, texPosBuf)
    // let fdas = new Float32Array([0., 0., 0., 1., 1., 0., 1., 0., 0., 1., 1., 1.])
    // Render.gl.bufferData(Render.gl.ARRAY_BUFFER, fdas, Render.gl.STATIC_DRAW);
    // Render.gl.enableVertexAttribArray(positionLocation)
    // Render.gl.vertexAttribPointer(positionLocation, 2, Render.gl.FLOAT, false, 0, 0)

    // let texCoordBuf = Render.gl.createBuffer()
    // Render.gl.bindBuffer(Render.gl.ARRAY_BUFFER, texCoordBuf)
    // let fdas2 : Float32Array = [0., 0., 0., 1., 1., 0., 1., 0., 0., 1., 1., 1.] as unknown as Float32Array;
    // Render.gl.bufferData(Render.gl.ARRAY_BUFFER, fdas2, Render.gl.STATIC_DRAW);
    // Render.gl.enableVertexAttribArray(texCoordLocation)
    // Render.gl.vertexAttribPointer(texCoordLocation, 2, Render.gl.FLOAT, false, 0, 0)


    // let matrix : Float32Array = new Float32Array(16)

    // Render.gl.uniformMatrix4fv(matrixLocation, false, matrix)
    // Render.gl.uniformMatrix4fv(texMatrixLocation, false, new Float32Array(16))
    // // Render.gl.uniform
    // Render.gl.uniform1i(textureLocation, 0);
    let vertexBuffer = Render.gl.createBuffer();
    Render.gl.bindBuffer(Render.gl.ARRAY_BUFFER, vertexBuffer);
    let vertexArray = new Float32Array([
      -0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
      -0.5, 0.5, 0.5, -0.5, -0.5, -0.5
    ]);
    Render.gl.bufferData(Render.gl.ARRAY_BUFFER, vertexArray, Render.gl.STATIC_DRAW);

    // Render.gl
    Render.gl.clearColor(1.0, 0.8, 1.0, 1.0);
    Render.gl.clear(Render.gl.COLOR_BUFFER_BIT);

    // aVertexPosition =
    // gl.getAttribLocation(shaderProgram, "aVertexPosition");

    // Render.gl.enableVertexAttribArray(positionLocation);
    // Render.gl.vertexAttribPointer(positionLocation, 2,
    //   Render.gl.FLOAT, false, 0, 0);

    let matrix = Render.orthographic(0, Render.gl.canvas.width, Render.gl.canvas.height, 0, -1, 1);
    Render.gl.uniformMatrix4fv(matrixLocation, false, matrix);



    Render.gl.drawArrays(Render.gl.TRIANGLES,0,6)
  }

  private deplacer(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1
    ];
  }
   
  private tourner(angleEnRadians) {
    var c = Math.cos(angleEnRadians);
    var s = Math.sin(angleEnRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1
    ];
  }
   
  private changerEchelle(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1
    ];
  }

  private static drawSubImage(
    tex : WebGLTexture, x : number, y : number, 
    sourceX: number, sourceY : number, 
    sourceWidth : number, sourceHeight : number){
    
    
  }

  private static testCode(){
    // Get attributes
    let positionLocation = Render.gl.getAttribLocation(Render.shaders['mainShader'], "positionLocation");
    let texcoordLocation = Render.gl.getAttribLocation(Render.shaders['mainShader'], "texcoordLocation");



    let webgUniform : WebGLUniformLocation = Render.gl.getUniformLocation(Render.shaders['mainShader'], "matrixLocation");
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

}

export default Render
