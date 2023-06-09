import { defs, tiny } from "./examples/common.js";

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Shader,
  Material,
  Scene,
  Texture,
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
      // cylinder: new defs.Cylindrical_Tube(10, 10, [[0, 0, 0], [0, 1, 0]], [[2, 0, 0], [2, 1, 0]])
      cylinder: new defs.Capped_Cylinder(100, 100),
    };

    // *** Materials
    this.materials = {
      plastic: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#89CFF0"),
      }),
      plastic_gourad: new Material(new Gouraud_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#89CFF0"),
        specularity: 1,
      }),
      cube: new Material(new Textured_Phong(), {
        ambient: 0.3,
        diffusivity: 0.2,
        specularity: 0,
        texture: new Texture("assets/wall_stones.jpeg"),
        color: hex_color("#C1E1C1"), // Pastel green color
      }),
      cylinder_base: new Material(new defs.Phong_Shader(), {
        ambient: 0.3,
        diffusivity: 0.2,
        specularity: 0,
        color: hex_color("#EE4B2B"),
      }),
      lazer: new Material(new defs.Phong_Shader(), {
        ambient: 0.3,
        diffusivity: 0.2,
        specularity: 0,
        color: hex_color("#FFF000"),
      }),
      cylinder_collison: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 0,
        specularity: 0,
        color: color(0, 0, 0, 0),
      }),
      cylinder_collison_border_on: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 0,
        specularity: 0,
        color: hex_color("#EE4B2B"),
      }),
    };


    const data_members = {
      thrust: vec3(0, 0, 0),
      meters_per_frame: 7,
      speed_multiplier: 1,
    };

    Object.assign(this, data_members);

    this.sphere_radius = 0.5;
    this.starting_pos = vec4(0, 7, 0, 1);
    this.avatar_point = this.starting_pos;
    this.avatar_transform = Mat4.translation(
      this.avatar_point[0],
      this.avatar_point[1],
      this.avatar_point[2]
    ).times(
      Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius)
    );
    this.jump = true;
    this.BOX_SIZE_units = 2;

    this.platform_coords = Vector3.cast(
      [-1, 0, -1],
      [-1, 0, 0],
      [-1, 0, 1],
      [-1, 0, 2],
      [-1, 0, 3],
      [-1, 0, 4],
      [-1, 0, 5],
      [-1, 0, 6],
      [-1, 0, 7],
      [-1, 0, 8],
      [0, 0, -1],
      [0, 0, 0],
      [0, 0, 1],
      [0, 0, 2],
      [0, 0, 3],
      [0, 0, 4],
      [0, 0, 5],
      [0, 0, 6],
      [0, 0, 7],
      [0, 0, 8],
      [1, 0, -1],
      [1, 0, 0],
      [1, 0, 1],
      [1, 0, 2],
      [1, 0, 3],
      [1, 0, 4],
      [1, 0, 5],
      [1, 0, 6],
      [1, 0, 7],
      [1, 0, 8],
      [2, 0, -1],
      [2, 0, 0],
      [2, 0, 1],
      [2, 0, 6],
      [2, 0, 7],
      [2, 0, 8],
      [3, 0, -1],
      [3, 0, 0],
      [3, 0, 1],
      [3, 0, 6],
      [3, 0, 7],
      [3, 0, 8],
      [4, 0, -1],
      [4, 0, 0],
      [4, 0, 1],
      [4, 0, 6],
      [4, 0, 7],
      [4, 0, 8],
      [5, 0, -1],
      [5, 0, 0],
      [5, 0, 1],
      [5, 0, 6],
      [5, 0, 7],
      [5, 0, 8],
      [6, 0, -1],
      [6, 0, 0],
      [6, 0, 1],
      [6, 0, 2],
      [6, 0, 3],
      [6, 0, 4],
      [6, 0, 5],
      [6, 0, 6],
      [6, 0, 7],
      [6, 0, 8],
      [7, 0, -1],
      [7, 0, 0],
      [7, 0, 1],
      [7, 0, 2],
      [7, 0, 3],
      [7, 0, 4],
      [7, 0, 5],
      [7, 0, 6],
      [7, 0, 7],
      [7, 0, 8],
      [8, 0, -1],
      [8, 0, 0],
      [8, 0, 1],
      [8, 0, 2],
      [8, 0, 3],
      [8, 0, 4],
      [8, 0, 5],
      [8, 0, 6],
      [8, 0, 7],
      [8, 0, 8]
    );

    // GAME LOGISTIC VARIABLES
    this.start_game = false;
    this.lives = 3;
    this.first_time = 0;
    this.second_time = 0;
    this.third_time = 0;
    this.time_offset = null;
    this.time_past = 0;
    this.time_for_level = 0;
    this.hi_score = 0;
    this.border_on = false;
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements
    this.key_triggered_button(
      "Forward",
      ["w"],
      () => (this.thrust[2] = -1),
      undefined,
      () => (this.thrust[2] = 0)
    );
    this.key_triggered_button(
      "Left",
      ["a"],
      () => (this.thrust[0] = -1),
      undefined,
      () => (this.thrust[0] = 0)
    );
    this.key_triggered_button(
      "Back",
      ["s"],
      () => (this.thrust[2] = 1),
      undefined,
      () => (this.thrust[2] = 0)
    );
    this.key_triggered_button(
      "Right",
      ["d"],
      () => (this.thrust[0] = 1),
      undefined,
      () => (this.thrust[0] = 0)
    );
    this.key_triggered_button(
      "Up",
      [" "],
      () => {
        if (!this.jump) {
          this.thrust[1] = 2.5;
          this.jump = true;
        }
      },
      undefined,
      () => {
        this.thrust[1] = 0;
      },
      undefined
    );

    this.key_triggered_button(
      "Turn on Border", ["b"], () => {
        this.border_on = !this.border_on;
      }
    );
    this.key_triggered_button("Start game", ["Enter"], () => {
      const titles = Array.from(document.getElementsByClassName("title-card"));
      titles.forEach((el) => (el.style.display = "none"));
      const ui = Array.from(document.getElementsByClassName("interface"));
      ui.forEach((el) => (el.style.display = "block"));
      this.start_game = true;
    });
  }

  draw_platform(context, program_state) {
    const platform_coords = this.platform_coords;
    for (let i = 0; i < platform_coords.length; i++) {
      let x = platform_coords[i][0] * this.BOX_SIZE_units,
        y = platform_coords[i][1] * this.BOX_SIZE_units,
        z = -platform_coords[i][2] * this.BOX_SIZE_units;
      this.shapes.cube.draw(
        context,
        program_state,
        Mat4.translation(x, y, z),
        this.materials.cube
      );
    }
  }

  draw_cylinder(context, program_state) {
    const cylinder_transform = Mat4.translation(7, 1, -7) // Adjust the translation values as needed
      .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(1.5, 1.5, 5));

    this.shapes.cylinder.draw(
      context,
      program_state,
      cylinder_transform,
      this.materials.cylinder_base
    );
  }

  draw_bat(context, program_state, t) {
    let orbit = t;
    const rotation_angle = orbit; // Adjust the rotation angle based on your requirements

    const bat_transform = Mat4.translation(7, 1.5, -7) // Adjust the translation values as needed
      .times(Mat4.rotation(rotation_angle * 2, 0, 1, 0)) // Apply the rotation around the y-axis
      .times(Mat4.scale(0.5, 0.5, 30));

    const bat_collision_border_transform = Mat4.translation(7, 1.5, -7) // Adjust the translation values as needed x, y, z
      .times(Mat4.rotation(orbit * 2, 0, 1, 0)) // Apply the rotation around the y-axis
      .times(Mat4.scale(0.4, 0.4, 15));

    const twoDim_corners = [
      vec4(
        -0.5 * this.BOX_SIZE_units,
        -0.5 * this.BOX_SIZE_units,
        -0.5 * this.BOX_SIZE_units,
        1
      ),
      vec4(
        0.5 * this.BOX_SIZE_units,
        -0.5 * this.BOX_SIZE_units,
        -0.5 * this.BOX_SIZE_units,
        1
      ),
      vec4(
        -0.5 * this.BOX_SIZE_units,
        -0.5 * this.BOX_SIZE_units,
        0.5 * this.BOX_SIZE_units,
        1
      ),
      vec4(
        0.5 * this.BOX_SIZE_units,
        -0.5 * this.BOX_SIZE_units,
        0.5 * this.BOX_SIZE_units,
        1
      ),
    ];

    const transformed_corners = twoDim_corners.map((corner) =>
      bat_collision_border_transform.times(corner)
    );

    // for every edge in the rectangle D = (x2 - x1) * (yp - y1) - (xp - x1) * (y2 - y1)
    // if all D have the same sign, then the point is inside the rectangle
    //MAKE SURE ITS COUNTERCLOCKWISE

    let x1 = transformed_corners[0][0],
      y1 = transformed_corners[0][2],
      x2 = transformed_corners[1][0],
      y2 = transformed_corners[1][2],
      x3 = transformed_corners[2][0],
      y3 = transformed_corners[2][2],
      x4 = transformed_corners[3][0],
      y4 = transformed_corners[3][2];
    let xp = this.avatar_point[0],
      yp = this.avatar_point[2];

    let D1 = (x1 - x2) * (yp - y2) - (xp - x2) * (y1 - y2);
    let D2 = (x3 - x1) * (yp - y1) - (xp - x1) * (y3 - y1);
    let D3 = (x4 - x3) * (yp - y3) - (xp - x3) * (y4 - y3);
    let D4 = (x2 - x4) * (yp - y4) - (xp - x4) * (y2 - y4);

    if (
      (D1 > 0 && D2 > 0 && D3 > 0 && D4 > 0) ||
      (D1 < 0 && D2 < 0 && D3 < 0 && D4 < 0)
    ) {
      if (this.avatar_point[1] <= transformed_corners[0][1] + 0.5) {
        this.avatar_point = this.starting_pos;
        if (this.lives == 3) {
          this.first_time = this.time_past;
        } else if (this.lives == 2) {
          this.second_time = this.time_past;
        } else {
          this.third_time = this.time_past;
        }
        this.lives -= 1;
      }
    }

    this.shapes.cylinder.draw(
      context,
      program_state,
      bat_transform,
      this.materials.lazer
    );

    if (this.border_on == false ) {
      this.shapes.cube.draw(
        context,
        program_state,
        bat_collision_border_transform,
        this.materials.cylinder_collison
      );
    } else {
      this.shapes.cube.draw(
        context,
        program_state,
        bat_collision_border_transform,
        this.materials.cylinder_collison_border_on
      );
    }
  
  

    //Draw spheres at corner for debugging purpose
    // for (let i = 0; i < transformed_corners.length; i++) {
    //     const sphere_transform = Mat4.translation(transformed_corners[i][0], transformed_corners[i][1], transformed_corners[i][2])
    //         .times(Mat4.scale(0.1, 0.1, 0.1));
    //     this.shapes.sphere.draw(context, program_state, sphere_transform, this.materials.plastic);
    // }
  }

  display(context, program_state) {
    // display():  Called once per frame of animation.
    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!this.start_game) {
      return;
    }

    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;
    if (this.start_game && !this.time_offset) {
      this.time_offset = Math.floor(t);
    }
    if (this.lives == 3) {
      this.time_past = this.time_for_level + Math.floor(t) - this.time_offset;
    } else if (this.lives == 2) {
      this.time_past =
        this.time_for_level +
        Math.floor(t) -
        this.time_offset -
        this.first_time;
    } else if (this.lives == 1) {
      this.time_past =
        this.time_for_level +
        Math.floor(t) -
        this.time_offset -
        this.first_time -
        this.second_time;
    }

    // END GAME
    if (this.lives <= 0) {
      this.start_game = false;
      this.time_offset = null;

      this.avatar_point = this.starting_pos;
      this.avatar_transform = Mat4.translation(
        this.avatar_point[0],
        this.avatar_point[1],
        this.avatar_point[2]
      ).times(
        Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius)
      );

      this.hi_score = Math.max(
        this.first_time,
        this.second_time,
        this.third_time
      );

      document.getElementById("first-score").innerHTML = this.first_time;
      document.getElementById("second-score").innerHTML = this.second_time;
      document.getElementById("third-score").innerHTML = this.third_time;

      document.getElementById("hi-score").innerHTML = this.hi_score;
      document.getElementById("game-over").style.display = "block";

      const ui = Array.from(document.getElementsByClassName("interface"));
      ui.forEach((el) => (el.style.display = "none"));

      this.lives = 3;
      this.time_for_level = 0;

      return;
    }

    // MOVE AVATAR AND CAMERA based on key input
    const m = this.speed_multiplier * this.meters_per_frame;
    this.avatar_transform.pre_multiply(
      Mat4.translation(...this.thrust.times(dt * m))
    );
    this.avatar_point = Mat4.translation(...this.thrust.times(dt * m)).times(
      this.avatar_point
    );
    let gravity;
    gravity = 0.07;
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
      if (distance < this.sphere_radius) {
        this.jump = false;
        if (
          this.thrust[1] < 0 &&
          this.avatar_point[1] > 0.1 * this.BOX_SIZE_units
        ) {
          this.avatar_point[1] += overlap;
          this.thrust[1] = 0;
        }
        if (this.thrust[0] > 0) {
          this.avatar_point[0] -= overlap;
        }
        if (this.thrust[0] < 0) {
          this.avatar_point[0] += overlap;
        }
        if (this.thrust[2] > 0) {
          this.avatar_point[2] -= overlap;
        }
        if (this.thrust[2] < 0) {
          this.avatar_point[2] += overlap;
        }
        this.avatar_transform = Mat4.translation(
          this.avatar_point[0],
          this.avatar_point[1],
          this.avatar_point[2]
        ).times(
          Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius)
        );
      }
    }

    this.avatar_transform = Mat4.translation(
      this.avatar_point[0],
      this.avatar_point[1],
      this.avatar_point[2]
    ).times(
      Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius)
    );

    // TODO: resets position if the ball fell to certain height
    if (this.avatar_point[1] <= -3) {
      this.thrust[1] = 0;
      this.avatar_point = this.starting_pos;
      this.avatar_transform = Mat4.translation(
        this.avatar_point[0],
        this.avatar_point[1],
        this.avatar_point[2]
      ).times(
        Mat4.scale(this.sphere_radius, this.sphere_radius, this.sphere_radius)
      );
      if (this.lives == 3) {
        this.first_time = this.time_past;
      } else if (this.lives == 2) {
        this.second_time = this.time_past;
      } else {
        this.third_time = this.time_past;
      }
      this.lives -= 1;
    }

    // TODO: Tweak eye point as necessary to make the game look good
    let eye_point = this.avatar_point.to3().plus(vec3(0, 3.6, 6));
    let camera_matrix = Mat4.look_at(
      eye_point,
      this.avatar_point.to3(),
      vec3(0, 1, 0)
    );
    program_state.set_camera(camera_matrix);
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      1,
      100
    );

    // *** Lights: *** Values of vector or point lights.
    const light_position = vec4(8, 10, -6, 1);
    var radius = 2 + Math.sin(((2 * Math.PI) / 8) * t);
    program_state.lights = [
      new Light(light_position, hex_color("#b0f542"), 1000),
    ];

    // DRAW OBJECTS

    if(Math.floor(t % 2) == 0) {
      this.shapes.sphere.draw(
        context,
        program_state,
        this.avatar_transform,
        this.materials.plastic
      );
    } else {
      this.shapes.sphere.draw(
        context,
        program_state,
        this.avatar_transform,
        this.materials.plastic_gourad
      );
    }

    this.draw_platform(context, program_state);
    this.draw_cylinder(context, program_state);
    this.draw_bat(context, program_state, t);

    document.getElementById("lives").innerHTML = this.lives;
    document.getElementById("timer").innerHTML = this.time_past;
  }
}

class Textured_Phong extends defs.Phong_Shader {
  // **Textured_Phong** is a Phong Shader extended to addditionally decal a
  // texture image over the drawn shape, lined up according to the texture
  // coordinates that are stored at each shape vertex.
  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return (
      ` precision mediump float;
                const int N_LIGHTS = ` +
      this.num_lights +
      `;
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
                  } `
    );
  }
  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
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
                  } `
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
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
                  } `
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Add a little more to the base class's version of this method.
    super.update_GPU(
      context,
      gpu_addresses,
      gpu_state,
      model_transform,
      material
    );

    if (material.texture && material.texture.ready) {
      // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
      context.uniform1i(gpu_addresses.texture, 0);
      // For this draw, use the texture image from correct the GPU buffer:
      material.texture.activate(context);
    }
  }
}

class Gouraud_Shader extends Shader {
  // This is a Shader using Phong_Shader as template

  constructor(num_lights = 2) {
    super();
    this.num_lights = num_lights;
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return (
      ` 
      precision mediump float;
      const int N_LIGHTS = ` +
      this.num_lights +
      `;
      uniform float ambient, diffusivity, specularity, smoothness;
      uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
      uniform float light_attenuation_factors[N_LIGHTS];
      uniform vec4 shape_color;
      uniform vec3 squared_scale, camera_center;

      // Specifier "varying" means a variable's final value will be passed from the vertex shader
      // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
      // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
      varying vec3 N, vertex_worldspace;
      varying vec4 vertex_color;
      // ***** PHONG SHADING HAPPENS HERE: *****                                       
      vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
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
              
              vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                        + light_colors[i].xyz * specularity * specular;
              result += attenuation * light_contribution;
          }
          return result;
      } `
    );
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
          attribute vec3 position, normal;                            
          // Position is expressed in object coordinates.
          
          uniform mat4 model_transform;
          uniform mat4 projection_camera_model_transform;
  
          void main(){                                                                   
              // The vertex's final resting place (in NDCS):
              gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
              // The final normal vector in screen space.
              N = normalize( mat3( model_transform ) * normal / squared_scale);
              vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
          
              vertex_color = vec4(shape_color.xyz * ambient, shape_color.w);
              vertex_color.xyz += phong_model_lights(N, vertex_worldspace);
          } `
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
          void main(){
              gl_FragColor = vertex_color;
              return;                                                           
              // Compute an initial (ambient) color:
              // gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
              // Compute the final color with contributions from lights:
              // gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
          } `
    );
  }

  send_material(gl, gpu, material) {
    // send_material(): Send the desired shape-wide material qualities to the
    // graphics card, where they will tweak the Phong lighting formula.
    gl.uniform4fv(gpu.shape_color, material.color);
    gl.uniform1f(gpu.ambient, material.ambient);
    gl.uniform1f(gpu.diffusivity, material.diffusivity);
    gl.uniform1f(gpu.specularity, material.specularity);
    gl.uniform1f(gpu.smoothness, material.smoothness);
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
    // send_gpu_state():  Send the state of our whole drawing context to the GPU.
    const O = vec4(0, 0, 0, 1),
      camera_center = gpu_state.camera_transform.times(O).to3();
    gl.uniform3fv(gpu.camera_center, camera_center);
    // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
    const squared_scale = model_transform
      .reduce((acc, r) => {
        return acc.plus(vec4(...r).times_pairwise(r));
      }, vec4(0, 0, 0, 0))
      .to3();
    gl.uniform3fv(gpu.squared_scale, squared_scale);
    // Send the current matrices to the shader.  Go ahead and pre-compute
    // the products we'll need of the of the three special matrices and just
    // cache and send those.  They will be the same throughout this draw
    // call, and thus across each instance of the vertex shader.
    // Transpose them since the GPU expects matrices as column-major arrays.
    const PCM = gpu_state.projection_transform
      .times(gpu_state.camera_inverse)
      .times(model_transform);
    gl.uniformMatrix4fv(
      gpu.model_transform,
      false,
      Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    gl.uniformMatrix4fv(
      gpu.projection_camera_model_transform,
      false,
      Matrix.flatten_2D_to_1D(PCM.transposed())
    );

    // Omitting lights will show only the material color, scaled by the ambient term:
    if (!gpu_state.lights.length) return;

    const light_positions_flattened = [],
      light_colors_flattened = [];
    for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
      light_positions_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].position[i % 4]
      );
      light_colors_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].color[i % 4]
      );
    }
    gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
    gl.uniform4fv(gpu.light_colors, light_colors_flattened);
    gl.uniform1fv(
      gpu.light_attenuation_factors,
      gpu_state.lights.map((l) => l.attenuation)
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
    // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
    // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
    // program (which we call the "Program_State").  Send both a material and a program state to the shaders
    // within this function, one data field at a time, to fully initialize the shader for a draw.

    // Fill in any missing fields in the Material object with custom defaults for this shader:
    const defaults = {
      color: color(0, 0, 0, 1),
      ambient: 0,
      diffusivity: 1,
      specularity: 1,
      smoothness: 40,
    };
    material = Object.assign({}, defaults, material);

    this.send_material(context, gpu_addresses, material);
    this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
  }
}
