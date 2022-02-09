import { resolve } from "path/posix"
import Render from "./render"

export default class Assets {
  private static imgTypes: Array<string> = ['png','jpg']
  private static txtTypes: Array<string> = ['nw','txt']
  private static images: { [id: string] : HTMLImageElement} = {}
  public static texts: { [id: string] : string} = {}
  private static totalAssets : number = 0
  private static loadedAssets: number = 0;

  public static getImage(id:string) : HTMLImageElement {
    return Assets.images[id]
  }
  public static getText(id:string) : string {
    return Assets.texts[id]
  }

  public static async loadAssets(assetList: {[id: string]: string}) : Promise<void[]>{
    let assetPromises: Array<Promise<void>> = []
    
    for(let ast in assetList){
      assetPromises.push(new Promise (resolve=>{
        resolve(Assets.loadAsset(ast,assetList[ast]))
      }))
    }
    console.log(assetPromises)
    return await Promise.all(assetPromises)
  }
  
  private static async loadAsset(id : string, file : string) : Promise<void> {
    let splt : Array<string> = file.split('/')
    let fileName : Array<string> = splt[splt.length-1].split('.')
    
    if(Assets.imgTypes.indexOf(fileName[fileName.length-1]) > - 1) {
      await Assets.loadImage(id,file)
    } else if (Assets.txtTypes.indexOf(fileName[fileName.length-1]) > - 1) {
      await Assets.loadText(id,file)
    }

  }

  private static async blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  private static async loadImage(id:string,file:string): Promise<void>{

    // var myImage = document.createElement('img');

// let myRequest = new Request(file);
// console.log(myRequest.url)

// fetch(myRequest)
// .then(response => response.blob())
// .then(myBlob => myBlob.arrayBuffer()).then(myBlob => Assets.images[id] = myBlob)
// .then(function(myBlob){
//   // new Blob(myBlob,  {typ e: 'image/png'})
//   console.log(myBlob)
//   let objectURL = URL.createObjectURL(myBlob);
//   myImage.src = objectURL;
//   Assets.images[id] = myImage
// })

    
    // let request = new Request(file)
    let response = await fetch(file)
    console.log(response)

    // if (!response.ok) {
    //   throw new Error(`Erreur HTTP ! statut : ${response.status}`);
    // }
  
    let myBlob = await response.blob()
    console.log(myBlob)

    // console.log((new URL('blob:http://localhost:8080')))

    let ab : any = await this.blobToBase64(myBlob)
    // let src = "data:image/png;base64,"+ab
    // let abBlob : Blob = new Blob([ab], {type:"image/png"})
    // myBlob
    
    // new Blob(myBlob, {type:'image/png'});

    // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
    // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await#rewriting_promise_code_with_asyncawait

    await new Promise<void>(resolve=> {
      let image = document.createElement('img');
      image.src = ab;
      // resolve();
      image.addEventListener("load", ()=>{        
        Assets.images[id] = image
        resolve()})

      // let url : URL = new URL('http://localhost:8000')
      // let objectURL = URL.createObjectURL(myBlob);
      // let url = objectURL.replace('null','http://localhost:8003')
      // obje
      // let blob = new Blob([objectURL], {type: "image/png"})
      // console.log(myBlob)
      // console.log(objectURL)
      
      
      // let blob1 = new Blob(["Hello world!"], { type: "text/html" });
      // let url = URL.createObjectURL(blob1);
      // console.log(url)

    })

    //   let image : HTMLImageElement = new Image();
    //   image.src = file;
    //   image.onload = () => {
    //     Assets.images[id] = image
    //     resolve()
    //   };
  }

  private static async loadText(id:string,file:string): Promise<void>{
    const response = await fetch(file)
    const data = await response.text();
    Assets.texts[id] = data;
  }
}