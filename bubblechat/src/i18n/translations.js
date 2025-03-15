export const translations = {
  en: {
    chat: {
      inputPlaceholder: 'Type your message...',
      sendButton: 'Send',
      you: 'You',
      assistant: 'Assistant',
      system: 'System',
      copy: 'Copy message',
      copySuccess: 'Copied to clipboard!'
    },
    common: {
      settings: 'Settings',
      api: 'API',
      about: 'About',
      newChat: 'New Chat',
      close: 'Close',
      save: 'Save',
      cancel: 'Cancel',
      rename: 'Rename',
      delete: 'Delete',
      pin: 'Pin to top',
      unpin: 'Unpin from top'
    },
    settings: {
      commonSettings: 'Common Settings',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      apiProviders: 'API Providers',
      apiKey: 'API Key',
      apiUrl: 'API URL',
      model: 'Model',
      selectModel: 'Select a model',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      viewApiDocs: 'View API Documentation'
    },
    about: {
      title: 'About BubbleChat',
      description: 'DEEPSEEK CHAT CLINET ONLY. DEEPSEEK MODELS BASE ON DIFFERENT API',
      githubLink: 'View on GitHub',
      close: 'Close'
    }
  },
  zh: {
    chat: {
      inputPlaceholder: '输入消息...',
      sendButton: '发送',
      you: '你',
      assistant: '助手',
      system: '系统',
      copy: '复制消息',
      copySuccess: '已复制到剪贴板！'
    },
    common: {
      settings: '设置',
      api: 'API',
      about: '关于',
      newChat: '新对话',
      close: '关闭',
      save: '保存',
      cancel: '取消',
      rename: '重命名',
      delete: '删除',
      pin: '置顶对话',
      unpin: '取消置顶'
    },
    settings: {
      commonSettings: '通用设置',
      language: '语言',
      theme: '主题',
      light: '浅色',
      dark: '深色',
      apiProviders: 'API 提供商',
      apiKey: 'API 密钥',
      apiUrl: 'API 地址',
      model: '模型',
      selectModel: '选择模型',
      testConnection: '测试连接',
      testing: '测试中...',
      viewApiDocs: '查看 API 文档'
    },
    about: {
      title: '关于 BubbleChat',
      description: 'DEEPSEEK客户端，基于全网各平台API',
      githubLink: '在 GitHub 上查看',
      close: '关闭'
    }
  }
};

export const useTranslations = (language) => {
  return (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    
    return value || key;
  };
};
