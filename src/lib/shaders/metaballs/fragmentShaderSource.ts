export interface GetMetaballsFragmentShaderSrcArgs {
	width: number;
	height: number;
	numMetaballs: number;
}

export const getFragmentShaderSrc = ({
	height,
	numMetaballs,
	width,
}: GetMetaballsFragmentShaderSrcArgs) => `
precision highp float;

const float WIDTH = ${width >> 0}.0;
const float HEIGHT = ${height >> 0}.0;

uniform vec3 metaballs[${numMetaballs}];

void main(){
		float x = gl_FragCoord.x;
		float y = gl_FragCoord.y;

		float sum = 0.0;
		for (int i = 0; i < ${numMetaballs}; i++) {
				vec3 metaball = metaballs[i];
				float dx = metaball.x - x;
				float dy = metaball.y - y;
				float radius = metaball.z;

				sum += ((radius * radius) / (dx * dx + dy * dy));
		}

		if (sum >= .99) {
				// gl_FragColor = vec4(mix(vec3(x / WIDTH, y / HEIGHT, 1.0), vec3(0, 0, 0), max(0.0, 1.0 - (sum - 0.99) * 100.0)), 1.0);
				// gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
				// gl_FragColor = vec4(mix(vec3(x / WIDTH, y / HEIGHT, 1.0), vec3(-sum, -sum, -sum), max(0.0, 3.1 - (sum - 0.99) * 100.0)), 1.0);

				return;
		}

		// gl_FragColor = vec4(sum, sum, sum, 1.0);
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`;
