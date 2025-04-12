import { WebContainer } from '@webcontainer/api';

class WebContainerService {
  constructor() {
    this.webcontainer = null;
    this.terminal = null;
    this.initialized = false;
    this.shellProcess = null;
  }

  /**
   * Initialize the WebContainer instance
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Boot the WebContainer
      this.webcontainer = await WebContainer.boot();
      this.initialized = true;
      console.log('WebContainer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
      throw error;
    }
  }

  /**
   * Set up a file system in the container with the provided files
   * @param {Object} files - Files to mount in the container
   * @returns {Promise<void>}
   */
  async setupFileSystem(files) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.webcontainer.mount(files);
      console.log('Files mounted successfully');
    } catch (error) {
      console.error('Failed to mount files:', error);
      throw error;
    }
  }

  /**
   * Run a command in the WebContainer
   * @param {string} command - Command to run
   * @param {Array<string>} args - Command arguments
   * @param {Object} options - Command options
   * @returns {Promise<{ exit: number, stdout: string, stderr: string }>}
   */
  async runCommand(command, args = [], options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const process = await this.webcontainer.spawn(command, args, options);
      const output = {
        stdout: '',
        stderr: '',
      };

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output.stdout += data;
          },
        })
      );

      process.stderr.pipeTo(
        new WritableStream({
          write(data) {
            output.stderr += data;
          },
        })
      );

      const exitCode = await process.exit;
      return {
        exit: exitCode,
        ...output,
      };
    } catch (error) {
      console.error(`Failed to run command ${command}:`, error);
      throw error;
    }
  }

  /**
   * Start an interactive shell
   * @param {HTMLPreElement} terminalEl - Terminal element to write output to
   * @returns {Promise<void>}
   */
  async startShell(terminalEl) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Start a shell process
      this.shellProcess = await this.webcontainer.spawn('jsh', {
        terminal: {
          cols: 80,
          rows: 24,
        },
      });

      const inputEl = document.querySelector('input#terminal-input');

      // Set up the input to send to the shell process
      inputEl.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
          const command = inputEl.value;
          await this.shellProcess.input(command + '\n');
          inputEl.value = '';
        }
      });

      // Pipe the output to the terminal element
      this.shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminalEl.textContent += data;
            // Scroll to bottom to follow output
            terminalEl.scrollTop = terminalEl.scrollHeight;
          },
        })
      );

      return this.shellProcess;
    } catch (error) {
      console.error('Failed to start shell:', error);
      throw error;
    }
  }

  /**
   * Install npm packages
   * @param {Array<string>} packages - Packages to install
   * @returns {Promise<{ success: boolean, output: string }>}
   */
  async installPackages(packages) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const installCommand = await this.runCommand('npm', ['install', ...packages]);
      
      return {
        success: installCommand.exit === 0,
        output: installCommand.stdout
      };
    } catch (error) {
      console.error('Failed to install packages:', error);
      return {
        success: false,
        output: error.message
      };
    }
  }

  /**
   * Run a Node.js project
   * @param {string} entryPoint - Entry point file (e.g., 'index.js')
   * @returns {Promise<WebContainerProcess>}
   */
  async runNodeProject(entryPoint = 'index.js') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const serverProcess = await this.webcontainer.spawn('node', [entryPoint]);
      return serverProcess;
    } catch (error) {
      console.error('Failed to run Node project:', error);
      throw error;
    }
  }

  /**
   * Create a preview URL for a server running in the container
   * @param {number} port - The port the server is running on
   * @returns {Promise<string>} - The URL for the preview
   */
  async getPreviewURL(port = 3000) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const url = await this.webcontainer.iframe.setURIPolicy([
        {
          rule: 'localhost:' + port,
          policy: 'allow',
        },
      ]);
      return url;
    } catch (error) {
      console.error('Failed to get preview URL:', error);
      throw error;
    }
  }

  /**
   * Write a file in the container
   * @param {string} path - Path to the file
   * @param {string} contents - File contents
   * @returns {Promise<void>}
   */
  async writeFile(path, contents) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.webcontainer.fs.writeFile(path, contents);
    } catch (error) {
      console.error(`Failed to write file ${path}:`, error);
      throw error;
    }
  }

  /**
   * Read a file from the container
   * @param {string} path - Path to the file
   * @returns {Promise<string>}
   */
  async readFile(path) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const contents = await this.webcontainer.fs.readFile(path, 'utf-8');
      return contents;
    } catch (error) {
      console.error(`Failed to read file ${path}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup resources when no longer needed
   */
  async teardown() {
    if (this.shellProcess) {
      this.shellProcess.kill();
    }
    // WebContainer API doesn't have an explicit teardown method
    this.initialized = false;
    console.log('WebContainer resources cleaned up');
  }
}

// Create a singleton instance
const webContainerService = new WebContainerService();
export default webContainerService;
