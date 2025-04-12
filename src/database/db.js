import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStoragePouch, addPouchPlugin } from 'rxdb/plugins/pouchdb';
import * as idb from 'pouchdb-adapter-idb';
import { replicationPlugin } from 'rxdb/plugins/replication';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';

// Add necessary plugins
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(replicationPlugin);
addPouchPlugin(idb);

// Schema definitions
const projectSchema = {
  title: 'project schema',
  version: 0,
  description: 'Projects created by users',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: ['pagebuilder', 'workflow', 'database', 'aiapp', 'custom']
    },
    created: {
      type: 'number'
    },
    updated: {
      type: 'number'
    },
    userId: {
      type: 'string'
    },
    settings: {
      type: 'object'
    },
    status: {
      type: 'string',
      enum: ['draft', 'published', 'archived']
    }
  },
  required: ['id', 'name', 'type', 'created', 'updated', 'userId']
};

const pageSchema = {
  title: 'page schema',
  version: 0,
  description: 'Pages within projects',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    projectId: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    slug: {
      type: 'string'
    },
    content: {
      type: 'object'
    },
    created: {
      type: 'number'
    },
    updated: {
      type: 'number'
    },
    version: {
      type: 'number',
      minimum: 1
    },
    meta: {
      type: 'object'
    }
  },
  required: ['id', 'projectId', 'title', 'created', 'updated', 'version']
};

const componentSchema = {
  title: 'component schema',
  version: 0,
  description: 'Reusable components',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    config: {
      type: 'object'
    },
    created: {
      type: 'number'
    },
    updated: {
      type: 'number'
    },
    userId: {
      type: 'string'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: ['id', 'name', 'type', 'created', 'updated']
};

const databaseSchema = {
  title: 'database schema',
  version: 0,
  description: 'Database configurations',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    projectId: {
      type: 'string'
    },
    tables: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          fields: {
            type: 'array',
            items: {
              type: 'object'
            }
          }
        }
      }
    },
    created: {
      type: 'number'
    },
    updated: {
      type: 'number'
    },
    userId: {
      type: 'string'
    }
  },
  required: ['id', 'name', 'projectId', 'created', 'updated', 'userId']
};

const aiChatSchema = {
  title: 'ai chat schema',
  version: 0,
  description: 'AI chat history',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    userId: {
      type: 'string'
    },
    projectId: {
      type: 'string'
    },
    messages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          role: {
            type: 'string',
            enum: ['user', 'assistant', 'system']
          },
          content: {
            type: 'string'
          },
          timestamp: {
            type: 'number'
          }
        }
      }
    },
    created: {
      type: 'number'
    },
    updated: {
      type: 'number'
    },
    title: {
      type: 'string'
    }
  },
  required: ['id', 'userId', 'messages', 'created', 'updated']
};

// Initialize the database
let dbPromise = null;

export const getDatabase = async () => {
  if (dbPromise) return dbPromise;

  dbPromise = createRxDatabase({
    name: 'nocodeai_db',
    storage: getRxStoragePouch('idb'),
    multiInstance: true,
    ignoreDuplicate: true
  });

  const db = await dbPromise;

  // Create collections
  await db.addCollections({
    projects: {
      schema: projectSchema
    },
    pages: {
      schema: pageSchema
    },
    components: {
      schema: componentSchema
    },
    databases: {
      schema: databaseSchema
    },
    aichats: {
      schema: aiChatSchema
    }
  });

  // Set up sync with server if online
  if (navigator.onLine) {
    try {
      // This is a placeholder for actual sync setup with your backend
      // You would configure this with your specific endpoints
      /*
      const syncProject = db.projects.syncGraphQL({
        url: '/api/graphql',
        pull: {
          queryBuilder: (doc) => ({
            query: `
              query syncProjects($userId: String!, $lastUpdated: Float!) {
                projects(userId: $userId, updatedGt: $lastUpdated) {
                  id, name, description, type, created, updated, userId, settings, status
                }
              }
            `,
            variables: {
              userId: localStorage.getItem('userId'),
              lastUpdated: doc ? doc.updated : 0
            }
          })
        },
        push: {
          // Configure push sync
        }
      });
      */
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Handle online/offline events
  window.addEventListener('online', () => {
    console.log('Application is online. Resuming sync...');
    // Restart sync
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline. Sync will resume when online.');
    // Pause sync or handle offline state
  });

  return db;
};

// Helper function to generate IDs
export const generateId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Export database service functions
export const DatabaseService = {
  async getProjects(userId) {
    const db = await getDatabase();
    return db.projects.find({
      selector: {
        userId
      }
    }).exec();
  },

  async createProject(projectData) {
    const db = await getDatabase();
    const now = Date.now();
    const project = {
      id: generateId(),
      created: now,
      updated: now,
      ...projectData
    };
    return db.projects.insert(project);
  },

  async getProject(projectId) {
    const db = await getDatabase();
    return db.projects.findOne({
      selector: {
        id: projectId
      }
    }).exec();
  },

  async updateProject(projectId, data) {
    const db = await getDatabase();
    const project = await db.projects.findOne({
      selector: {
        id: projectId
      }
    }).exec();

    if (!project) {
      throw new Error('Project not found');
    }

    return project.update({
      $set: {
        ...data,
        updated: Date.now()
      }
    });
  },

  async deleteProject(projectId) {
    const db = await getDatabase();
    const project = await db.projects.findOne({
      selector: {
        id: projectId
      }
    }).exec();

    if (!project) {
      throw new Error('Project not found');
    }

    return project.remove();
  },

  // Pages
  async getPagesForProject(projectId) {
    const db = await getDatabase();
    return db.pages.find({
      selector: {
        projectId
      }
    }).exec();
  },

  async createPage(pageData) {
    const db = await getDatabase();
    const now = Date.now();
    const page = {
      id: generateId(),
      created: now,
      updated: now,
      version: 1,
      ...pageData
    };
    return db.pages.insert(page);
  },

  // Database methods
  async getDatabases(userId) {
    const db = await getDatabase();
    return db.databases.find({
      selector: {
        userId
      }
    }).exec();
  },

  async createDatabase(databaseData) {
    const db = await getDatabase();
    const now = Date.now();
    const database = {
      id: generateId(),
      created: now,
      updated: now,
      tables: [],
      ...databaseData
    };
    return db.databases.insert(database);
  },

  // AI Chat methods
  async getChatHistory(userId, projectId = null) {
    const db = await getDatabase();
    const selector = { userId };
    if (projectId) {
      selector.projectId = projectId;
    }
    return db.aichats.find({
      selector
    }).exec();
  },

  async createChat(chatData) {
    const db = await getDatabase();
    const now = Date.now();
    const chat = {
      id: generateId(),
      created: now,
      updated: now,
      messages: [],
      ...chatData
    };
    return db.aichats.insert(chat);
  },

  async addMessageToChat(chatId, message) {
    const db = await getDatabase();
    const chat = await db.aichats.findOne({
      selector: {
        id: chatId
      }
    }).exec();

    if (!chat) {
      throw new Error('Chat not found');
    }

    const updatedMessages = [...chat.messages, {
      id: generateId(),
      timestamp: Date.now(),
      ...message
    }];

    return chat.update({
      $set: {
        messages: updatedMessages,
        updated: Date.now()
      }
    });
  }
};

export default DatabaseService;
