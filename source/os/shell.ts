///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
		

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list. 

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
			
			// date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- displays the current date and time");
            this.commandList[this.commandList.length] = sc;
			
			// whereami
            sc = new ShellCommand(this.shellWhereami,
                                  "whereami",
                                  "- displays the location of the user");
            this.commandList[this.commandList.length] = sc;
			
			// haiku
            sc = new ShellCommand(this.shellHaiku,
                                  "haiku",
                                  "- generates a Haiku just for you");
            this.commandList[this.commandList.length] = sc;
			
			// status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "- sets stats above the console");
            this.commandList[this.commandList.length] = sc;
			
			// blue screen of death
            sc = new ShellCommand(this.shellBSOD,
                                  "bsod",
                                  "- simulates a blue screen of death");
            this.commandList[this.commandList.length] = sc;
			
			// load a program
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- loads a program in the User Program Input");
            this.commandList[this.commandList.length] = sc;
			
			// run a program
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "- runs a loaded program given a PID value");
            this.commandList[this.commandList.length] = sc;
			
			// DOMISLOVE
            sc = new ShellCommand(this.shellDomIsLove,
                                  "domislove",
                                  "- What else would Dom be if not love?");
            this.commandList[this.commandList.length] = sc;
			objSharedCommandList = this.commandList;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
			
            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
		


        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
			_StdOut.advanceLine();
			_StdOut.putText("                            __");
			_StdOut.advanceLine();
			_StdOut.putText('     ,                    ," e`--o');
			_StdOut.advanceLine();
			_StdOut.putText("    ((                   (  | __,'");
			_StdOut.advanceLine();
			_StdOut.putText("     \\~-----------' \_;/     ~Woof!");
			_StdOut.advanceLine();
			_StdOut.putText("     (                      /");
			_StdOut.advanceLine();
			_StdOut.putText("     /) ._______________.  )");
			_StdOut.advanceLine();
			_StdOut.putText("    (( (               (( (");
			_StdOut.advanceLine();
			_StdOut.putText("     ``-'               ``-'");
			_StdOut.advanceLine();
			_StdOut.advanceLine();
			_StdOut.putText(">> Here... Have somewhat eh ascii art of a dog :/  <<");
        }
		
		public shellDate(args) {
            var m = new Date();
			var dateString = m.getUTCFullYear() +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();
			_StdOut.putText("The date & time is: "+ dateString);
        }
		
		public shellWhereami(args) {
			var states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
			var state = states[Math.floor(Math.random()*states.length)];
			_StdOut.putText("Believe it or not, you are actually in "+ state);
        }
		
		public shellHaiku(args) {
			//things and stuff...nothing to see here
			var adjective1 = new Array("sad", "young", "happy", "coward", "brave", "little");
			var verb1 = new Array("runs", "sleeps", "seeks", "eats", "fight", "dream");
			var adverb2 = new Array("quickly", "fully", "dimly", "hotly", "quite", "loudly");
			var noun1 = new Array("colonist", "pirate", "slave", "raider", "muffalo", "boomrat" );
			var preposition2 = new Array( "over", "under", "astride", "towards", "along", "backwards");
			var article1 = new Array("the", "this", "that", "our", "a", "some");
			var adjective2 = new Array("cold", "rough", "hot", "hidden", "red", "dark");
			var noun2 = new Array("desert", "mountain", "cave", "hill", "plain", "ruins");
			var verb2 = new Array( "speaking", "hunting", "jumping", "running", "working", "watching");
			var adverb3 = new Array("quietly", "gracefully", "knowingly", "peacefully", "intently", "silently");
			var arNums = new Array();
			//go through everything
			for(var i=0;i<10;i++) { 
			  arNums[i] = Math.round(Math.random() * 5);
			}
			//time to build!
			var haiku = adjective1[arNums[0]] + " ";
			haiku += noun1[arNums[1]] + " ";
			haiku += adverb2[arNums[2]] + " ";
			haiku += verb1[arNums[3]] + " ";
			var haiku2 = preposition2[arNums[4]] + " ";
			haiku2 += article1[arNums[5]] + " ";
			haiku2 += adjective2[arNums[6]] + " ";
			haiku2 += noun2[arNums[7]] + " ";
			var haiku3 = verb2[arNums[8]] + " ";
			haiku3 += adverb3[arNums[9]] + " ";
			//Print dammit... DID I STUDDAH?
			_StdOut.putText(haiku);
			_StdOut.advanceLine();
			_StdOut.putText(haiku2);
			_StdOut.advanceLine();
			_StdOut.putText(haiku3);
        }
		
		public shellStatus(args) {
            if (args.length > 0) {
				var statusMessage = "";
				for(var i=0; i<args.length; i++){
					statusMessage += args[i]+" ";
				}
				document.getElementById('statusArea').innerHTML = statusMessage;
			}
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
					case "ver":
                        _StdOut.putText("Displays the current version data");
                        break;
					case "shutdown":
                        _StdOut.putText("Shuts the kernel off");
                        break;
					case "cls":
                        _StdOut.putText("This command clears the screen adn resets the cursor postition");
                        break;
					case "man":
                        _StdOut.putText("Need Help?... You've come to the right place! You used `man` to get here so its kinda redundant on what it does... You can go away now...");
                        break;
					case "trace":
                        _StdOut.putText("This enables the OS trace");
                        break;
					case "rot13":
                        _StdOut.putText("Need to obfuscate something?... good... use the command rot13 followed by the string you want to obfuscate... like this! rot13 Alan");
                        break;
					case "prompt":
                        _StdOut.putText("This is pretty obvious...");
                        break;					
					case "date":
                        _StdOut.putText("displays the date dummy!");
                        break;		
					case "whereami":
                        _StdOut.putText("You should really know where you are...seriously");
                        break;	
					case "haiku":
                        _StdOut.putText("generates a haiku just for you!");
                        break;	
					case "status":
                        _StdOut.putText("Sets a new status message above the console... just use status <message>");
                        break;	
					case "bsod":
                        _StdOut.putText("Simulates a blue screen of death...");
                        break;
					case "load":
                        _StdOut.putText("run this command after you have valid hex inputed intop the User Program Input");
                        break;
					case "run":
						_StdOut.putText("run will execute the program with the PID that is specified... Ex: run 0");
                        break;
					case "domislove":
						_StdOut.putText("Who knows what wacky things Dom is up to?... Maybe Love?");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
		
		public shellBSOD(args) {
			// the all mighty blue screen of life...err...death
            _StdOut.bsod();
            _StdOut.resetXY(); 
			_Kernel.krnShutdown();
			var BSOD_jingle = document.getElementById("BSOD_jingle");
			var BSOD_image = document.getElementById("BSOD_image");
			BSOD_jingle.play();
			var c = document.getElementById("display");
			var ctx = c.getContext("2d");
			ctx.drawImage(BSOD_image, 0, 0);
        }
		
		public shellLoad(args){
			var program: string = document.getElementById('taProgramInput').value; //bring in value from html5 input
			program = Utils.trim(program); // remove white
			var isStillValidHex: boolean=true; // set false if any aprt is not hex
			var programArray: Array<string> = program.split(' ');
			if (program.length==0){isStillValidHex=false;} //disable if nothing there
			
			for(var i:number=0; i<programArray.length; i++){
				if(Utils.checkForValidHex(programArray[i])){
					isStillValidHex=true;
				}else{
					isStillValidHex=false;
				}
			}
			if(isStillValidHex){
				//_StdOut.putText("Congradulations...thats valid hex code!... lets do something with it!");
				var programString = '';
				for(var i = 0; i < programArray.length; i++){
                        programString += programArray[i];
                }
				var chars = programString.split('');
                var doubles = [];
                for(var i = 0; i < chars.length; i += 2){
                    doubles.push(chars[i] + chars[i+1]);
                }
				var num = _ProcessManager.load(doubles, 1); 
				if(num != -1){
					_StdOut.putText("We got a PID for ya: "+ num );
				}else{
					_StdOut.advanceLine();
					_StdOut.putText("Sorry... I couldn't load that :(");
				}
			}else{
				_StdOut.putText("Invalid Hex Code: ");
				_StdOut.putText(program);
			}
		}
		
		public shellRun(args){
			if (args.length > 0) {
				for(var i=0; i<args.length; i++){
					_StdOut.putText("Attempting to run PID: "+  args[i]);
					_StdOut.advanceLine();
					//_CPU.runProcess(pid);
				}
			}else{
				_StdOut.putText("No arguements provided (do you actually want to run something or just waste my time?)");
			}
		}
		
		public shellDomIsLove(args){
			//placeholder for what is to come
			_StdOut.putText("You will be find Dom's love overwhelming soon.");
			_StdOut.putText("This is just a placeholder for what is to come!");
		}

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

    }
}
