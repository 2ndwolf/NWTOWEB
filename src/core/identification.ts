import * as T from './type'


export class Identification {
  private static curr : number = 0

  public static newID() {
    Identification.curr += 1
    return Identification.curr.toString()
  }

  // public static hasID
}