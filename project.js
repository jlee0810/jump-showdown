import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Project extends Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */

    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            cube: new Material(new Textured_Phong, {
                ambient: 0.1,
                diffusivity: 0.2,
                specularity: 0.,
                texture: new Texture("assets/wall_stones.jpeg"),
                color: color(0.64, 0.94, 0.74, 1), // Pastel green color
                })                  
        };

        const data_members = {
            thrust: vec3(0, 0, 0), meters_per_frame: 7, speed_multiplier: 1,
        };


        Object.assign(this, data_members);

        this.sphere_radius = 0.5;
        this.starting_pos = vec4(0, 7, 0, 1)
        this.avatar_point = this.starting_pos;
        this.avatar_transform = Mat4.translation(this.avatar_point[0], this.avatar_point[1], this.avatar_point[2]).times(Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius));
        this.jump = true;
        this.BOX_SIZE_units = 2;


        this.platform_coords = Vector3.cast(
            [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3], [0, 0, 4], [0, 0, 5], [0, 0, 6], [0, 0, 7],
            [1, 0, 0], [1, 0, 1], [1, 0, 2], [1, 0, 3], [1, 0, 4], [1, 0, 5], [1, 0, 6], [1, 0, 7],
            [2, 0, 0], [2, 0, 1], [2, 0, 2], [2, 0, 3], [2, 0, 4], [2, 0, 5], [2, 0, 6], [2, 0, 7],
            [3, 0, 0], [3, 0, 1], [3, 0, 2], [3, 0, 3], [3, 0, 4], [3, 0, 5], [3, 0, 6], [3, 0, 7],
            [4, 0, 0], [4, 0, 1], [4, 0, 2], [4, 0, 3], [4, 0, 4], [4, 0, 5], [4, 0, 6], [4, 0, 7],
            [5, 0, 0], [5, 0, 1], [5, 0, 2], [5, 0, 3], [5, 0, 4], [5, 0, 5], [5, 0, 6], [5, 0, 7],
            [6, 0, 0], [6, 0, 1], [6, 0, 2], [6, 0, 3], [6, 0, 4], [6, 0, 5], [6, 0, 6], [6, 0, 7],
            [7, 0, 0], [7, 0, 1], [7, 0, 2], [7, 0, 3], [7, 0, 4], [7, 0, 5], [7, 0, 6], [7, 0, 7]
        );
        
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements 
        this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
        this.key_triggered_button("Left", ["a"], () => this.thrust[0] = -1, undefined, () => this.thrust[0] = 0);
        this.key_triggered_button("Back", ["s"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);
        this.key_triggered_button("Right", ["d"], () => this.thrust[0] = 1, undefined, () => this.thrust[0] = 0);
        this.key_triggered_button("Up", [" "], () => {
            if (!this.jump) {
              this.thrust[1] = 1.5;
              this.jump = true;
            }
          }, undefined, () => {
            this.thrust[1] = 0;
          }, undefined);
    }

    draw_platform(context, program_state) {
        const platform_coords = this.platform_coords;
        for (let i = 0; i < platform_coords.length; i++) {
            let x = platform_coords[i][0] * this.BOX_SIZE_units, y = platform_coords[i][1] * this.BOX_SIZE_units,
                z = -platform_coords[i][2] * this.BOX_SIZE_units;
            this.shapes.cube.draw(context, program_state, Mat4.translation(x, y, z),this.materials.cube);
        }
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:

        // MOVE AVATAR AND CAMERA based on key input
        const dt = program_state.animation_delta_time / 1000;
        const m = this.speed_multiplier * this.meters_per_frame;
        this.avatar_transform.pre_multiply(Mat4.translation(...this.thrust.times(dt*m)));
        this.avatar_point = Mat4.translation(...this.thrust.times(dt*m)).times(this.avatar_point);


        let gravity;
        gravity = 0.02;
        this.thrust[1] -= gravity;

        //Collision Detection
        const platform_coords = this.platform_coords;
        for (let i = 0; i < platform_coords.length; i++) {
            let box_maxX = (platform_coords[i][0] + 0.5) * this.BOX_SIZE_units;
            let box_minX = (platform_coords[i][0] - 0.5) * this.BOX_SIZE_units;
            let box_maxY = (platform_coords[i][1] + 0.5) * this.BOX_SIZE_units;
            let box_minY = (platform_coords[i][1] - 0.5) * this.BOX_SIZE_units;
            let box_maxZ = (-platform_coords[i][2] + 0.5) * this.BOX_SIZE_units;
            let box_minZ = (-platform_coords[i][2] - 0.5) * this.BOX_SIZE_units;
            let x = Math.max(box_minX, Math.min(this.avatar_point[0], box_maxX));
            let y = Math.max(box_minY, Math.min(this.avatar_point[1], box_maxY));
            let z = Math.max(box_minZ, Math.min(this.avatar_point[2], box_maxZ));
            let distance = Math.sqrt(
                (x - this.avatar_point[0]) * (x - this.avatar_point[0]) +
                (y - this.avatar_point[1]) * (y - this.avatar_point[1]) +
                (z - this.avatar_point[2]) * (z - this.avatar_point[2])
            );
            let overlap = this.sphere_radius - distance;
            if (distance < this.sphere_radius){
                this.jump = false;
                if(this.thrust[1] < 0 && this.avatar_point[1] > 0.1*this.BOX_SIZE_units) {
                        this.avatar_point[1] += overlap;
                        this.thrust[1] = 0;
                }
                if(this.thrust[0] > 0) {
                    this.avatar_point[0] -= overlap;
                }
                if(this.thrust[0] < 0) {
                    this.avatar_point[0] += overlap;
                }
                if(this.thrust[2] > 0) {
                    this.avatar_point[2] -= overlap;
                }
                if(this.thrust[2] < 0) {
                    this.avatar_point[2] += overlap;
                }
                this.avatar_transform = Mat4.translation(this.avatar_point[0], this.avatar_point[1], this.avatar_point[2])
                    .times(Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius));
            }
        }

        this.avatar_transform = Mat4.translation(this.avatar_point[0], this.avatar_point[1], this.avatar_point[2])
            .times(Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius));



        // TODO: resets position if the ball fell to certain height
        if (this.avatar_point[1] <= -3) {
            this.thrust[1] = 0;
            this.avatar_point = this.starting_pos;
            this.avatar_transform = Mat4.translation(this.avatar_point[0], this.avatar_point[1], this.avatar_point[2])
                .times(Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius));
        }

        // TODO: Tweak eye point as necessary to make the game look good
        let eye_point = (this.avatar_point.to3()).plus(vec3(0, 3.6, 6));
        let camera_matrix = Mat4.look_at(eye_point, this.avatar_point.to3(), vec3(0, 1, 0));
        program_state.set_camera(camera_matrix);

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];


        // DRAW OBJECTS
        const gray = hex_color("#808080");
        const darkgray =hex_color("#555555")
        const red = hex_color("#FF0000");
        let model_transform = Mat4.identity();
        
        const platform_scale = Mat4.scale(10, 0.4, 10);

        this.shapes.sphere.draw(context, program_state, this.avatar_transform, this.materials.plastic);
        this.draw_platform(context, program_state);
    }
}


class Textured_Phong extends defs.Phong_Shader {
    // **Textured_Phong** is a Phong Shader extended to addditionally decal a
    // texture image over the drawn shape, lined up according to the texture
    // coordinates that are stored at each shape vertex.
    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` precision mediump float;
                const int N_LIGHTS = ` + this.num_lights + `;
                uniform float ambient, diffusivity, specularity, smoothness;
                uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
                uniform float light_attenuation_factors[N_LIGHTS];
                uniform vec4 shape_color;
                uniform vec3 squared_scale, camera_center;
        
                // Specifier "varying" means a variable's final value will be passed from the vertex shader
                // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
                // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
                varying vec3 N, vertex_worldspace;
                // ***** PHONG SHADING HAPPENS HERE: *****                                       
                vec3 phong_model_lights( vec4 tex_color, vec3 N, vec3 vertex_worldspace ){                                        
                    // phong_model_lights():  Add up the lights' contributions.
                    vec3 E = normalize( camera_center - vertex_worldspace );
                    vec3 result = vec3( 0.0 );
                    for(int i = 0; i < N_LIGHTS; i++){
                        // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                        // light will appear directional (uniform direction from all points), and we 
                        // simply obtain a vector towards the light by directly using the stored value.
                        // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                        // the point light's location from the current surface point.  In either case, 
                        // fade (attenuate) the light as the vector needed to reach it gets longer.  
                        vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                                       light_positions_or_vectors[i].w * vertex_worldspace;                                             
                        float distance_to_light = length( surface_to_light_vector );
        
                        vec3 L = normalize( surface_to_light_vector );
                        vec3 H = normalize( L + E );
                        // Compute the diffuse and specular components from the Phong
                        // Reflection Model, using Blinn's "halfway vector" method:
                        float diffuse  =      max( dot( N, L ), 0.0 );
                        float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                        float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                        
                        vec3 light_contribution = tex_color.xyz   * light_colors[i].xyz * diffusivity * diffuse
                                                                  + light_colors[i].xyz * specularity * specular;
                        result += attenuation * light_contribution;
                      }
                    return result;
                  } `;
    }
    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                attribute vec3 position, normal;                            
                // Position is expressed in object coordinates.
                attribute vec2 texture_coord;
                
                uniform mat4 model_transform;
                uniform mat4 projection_camera_model_transform;
        
                void main(){                                                                   
                    // The vertex's final resting place (in NDCS):
                    gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                    // The final normal vector in screen space.
                    N = normalize( mat3( model_transform ) * normal / squared_scale);
                    vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                    // Turn the per-vertex texture coordinate into an interpolated variable.
                    f_tex_coord = texture_coord;
                  } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                uniform sampler2D texture;
        
                void main(){
                    // Sample the texture image in the correct place:
                    vec4 tex_color = texture2D( texture, f_tex_coord );
                    if( tex_color.w < .01 ) discard;
                                                                             // Compute an initial (ambient) color:
                    gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w );
                                                                             // Compute the final color with contributions from lights:
                    gl_FragColor.xyz += phong_model_lights( tex_color, normalize( N ), vertex_worldspace );
                  } `;
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Add a little more to the base class's version of this method.
        super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);

        if (material.texture && material.texture.ready) {
            // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
            context.uniform1i(gpu_addresses.texture, 0);
            // For this draw, use the texture image from correct the GPU buffer:
            material.texture.activate(context);
        }
    }
}