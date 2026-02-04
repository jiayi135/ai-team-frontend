import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Zap, 
  Shield, 
  Database, 
  GitBranch, 
  Cloud,
  Loader2
} from 'lucide-react';

interface ApiPermission {
  name: string;
  description: string;
  endpoint: string;
  methods: string[];
}

interface McpTool {
  name: string;
  server: string;
  description: string;
  tools: string[];
}

interface Skill {
  name: string;
  description: string;
  usage: string;
}

interface RoleCapabilities {
  apiPermissions: ApiPermission[];
  mcpTools: McpTool[];
  skills: Skill[];
}

interface RoleCapabilitiesPanelProps {
  roleName: string;
}

const getToolIcon = (server: string) => {
  switch (server) {
    case 'github':
      return <GitBranch size={18} className="text-slate-600" />;
    case 'cloudflare':
      return <Cloud size={18} className="text-orange-500" />;
    case 'vercel':
      return <Zap size={18} className="text-black" />;
    default:
      return <Database size={18} className="text-slate-400" />;
  }
};

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-blue-100 text-blue-700';
    case 'POST':
      return 'bg-green-100 text-green-700';
    case 'PUT':
      return 'bg-orange-100 text-orange-700';
    case 'DELETE':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export default function RoleCapabilitiesPanel({ roleName }: RoleCapabilitiesPanelProps) {
  const [capabilities, setCapabilities] = useState<RoleCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/roles/${roleName}/capabilities`);
        if (!response.ok) {
          throw new Error('Failed to fetch capabilities');
        }
        const data = await response.json();
        setCapabilities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCapabilities();
  }, [roleName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-blue-500" size={24} />
        <span className="ml-2 text-slate-600">加载角色能力...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-bold">加载失败</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!capabilities) {
    return <div className="text-slate-500">未找到角色能力定义</div>;
  }

  return (
    <div className="space-y-6">
      {/* API Permissions */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Shield size={16} className="text-blue-500" />
          API 权限
        </h4>
        <div className="space-y-2">
          {capabilities.apiPermissions.length > 0 ? (
            capabilities.apiPermissions.map((perm, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 text-sm">{perm.name}</span>
                  <div className="flex gap-1">
                    {perm.methods.map((method) => (
                      <Badge key={method} className={`text-[10px] ${getMethodColor(method)}`}>
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-1">{perm.description}</p>
                <code className="text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  {perm.endpoint}
                </code>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">无 API 权限</p>
          )}
        </div>
      </div>

      {/* MCP Tools */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Code2 size={16} className="text-purple-500" />
          MCP 工具链
        </h4>
        <div className="space-y-2">
          {capabilities.mcpTools.length > 0 ? (
            capabilities.mcpTools.map((tool, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  {getToolIcon(tool.server)}
                  <span className="font-semibold text-slate-900 text-sm">{tool.name}</span>
                  <Badge variant="outline" className="text-[10px]">{tool.server}</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-2">{tool.description}</p>
                <div className="flex flex-wrap gap-1">
                  {tool.tools.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">无 MCP 工具绑定</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Zap size={16} className="text-yellow-500" />
          技能库
        </h4>
        <div className="space-y-2">
          {capabilities.skills.length > 0 ? (
            capabilities.skills.map((skill, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 text-sm">{skill.name}</span>
                  <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">Skill</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-1">{skill.description}</p>
                <p className="text-xs text-slate-500 italic">用途: {skill.usage}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">无技能绑定</p>
          )}
        </div>
      </div>
    </div>
  );
}
