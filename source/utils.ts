/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {
		
        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */ 
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
		
        // String ->  Hex conversion check... true = hex, false = NOPE
        public static checkForValidHex(input: string): boolean{
            if (parseInt(input, 16) >= 0 && input.length == 2){ // gotta be 2 in length and the 16 in length is greater than 0 when parsed.
                return true; // this is hex
            }else{
                return false; // this is not hex
            }
        }
		// takes a string and encodes it in hex characters
		public static hexEncode(input: string): string{
			var hex, i;
			var result = "";
			for (i=0; i<input.length; i++) {
				hex = input.charCodeAt(i).toString(16);
				result += ("000"+hex).slice(-4);
			}
			return result;
		}
		// takes a hex string and decodes it from hex to ENGLISH
		public static hexDecode(input: string): string{
			var j;
			var hexes = input.match(/.{1,4}/g) || [];
			var back = "";
			for(j = 0; j<hexes.length; j++) {
				back += String.fromCharCode(parseInt(hexes[j], 16));
			}
			return back;
		}

    }
}
