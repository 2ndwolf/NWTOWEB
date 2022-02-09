<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex">
    <title>Quelques tests</title>
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400" rel="stylesheet">
    <link href="style.css" type="text/css" rel="stylesheet">
    
    <script id="tex-vertex-shader" type="x-shader/x-vertex">
    
        attribute vec4 positionLocation;
        attribute vec2 texcoordLocation;
        
        uniform mat4 matrixLocation;
        uniform mat4 textureMatrixLocation;
        
        varying vec2 v_texcoord;
        
        void main(void) {
        gl_Position = matrixLocation * positionLocation;
        v_texcoord = (textureMatrixLocation * vec4(texcoordLocation, 0, 1)).xy;
        }
    </script>
    
    <script id="tex-fragment-shader" type="x-shader/x-fragment">
        precision mediump float;
        
        varying vec2 v_texcoord;
        
        uniform sampler2D textureLocation;
        
        void main(void) {
        gl_FragColor = texture2D(textureLocation, v_texcoord);
        }
    </script>
    
    
    
    
    
    <script id="poly-vertex-shader" type="x-shader/x-vertex">
    
        attribute vec2 a_position;
        
        uniform mat3 u_matrix;
        
        void main() {
        // Multiply the position by the matrix.
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
        }
    
    </script>
    
    <!-- fragment shader -->
    <script id="poly-fragment-shader" type="x-shader/x-fragment">
        precision mediump float;
        
        uniform vec4 u_color;
        
        void main() {
        gl_FragColor = u_color;
        }
    </script>
  </head>


  <body>

    <script src="basics/webgl-utils.js"></script>
    <script src="basics/m4.js"></script>
    <script src="basics/m3.js"></script>
    <script src="WebDev0/init.js"
    pageToLoad="<?php echo $_GET['someVar']; ?>"
    id="initScript"></script>


    <header>
        <h1>Let's try some stuff</h1>
    </header>

    <nav>
        <a href="index.php?someVar=0">A</a>
        <a href="index.php?someVar=1">B</a>
        <a href="index.php?someVar=2">C</a>
    </nav>

    <main>
        <div class="affirmation">
            Act before hindsight or never learn<br>
            Stop being daunted by the unexpected<br>
            Forge, inspired by the bests<br>
            And be no statue, for those have no destination.
        </div>
    </main>

    <section>
    </section>

    <aside>
    </aside>



    <footer>
    </footer>

  </body>
</html>