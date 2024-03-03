/*glsl*/
export const vertexShaderSource = `
		  attribute float a_position;
		  uniform float u_chromaHue;
		  uniform float u_rms;

		  void main() {
		    float posY = 0.5; // Adjust as needed
		    float x = (a_position + 1.0) / 2.0;
		    float y = posY - a_position * posY;
		    gl_Position = vec4(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
		  }
		`;
