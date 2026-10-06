import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AUTH_SESSION_CHANGED_EVENT } from './useAuthSession';

type AuthMode = 'login' | 'register';

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }
  return fallback;
}

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      toast.error('请输入邮箱和密码');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, displayName: displayName.trim() }),
      });
      const payload: unknown = await response.json().catch(() => undefined);
      if (!response.ok) throw new Error(getErrorMessage(payload, mode === 'login' ? '登录失败' : '注册失败'));
      window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
      toast.success(mode === 'login' ? '登录成功' : '注册成功');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="auth-dialog sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? '登录 Odd漫创' : '注册 Odd漫创账号'}</DialogTitle>
          <DialogDescription>
            登录后可以同步账号配置与后台任务；不登录也可以继续在当前浏览器本地创作。
          </DialogDescription>
        </DialogHeader>

        <div className="auth-mode-switch" role="tablist" aria-label="账号操作">
          <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>登录</button>
          <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => setMode('register')}>注册</button>
        </div>

        <div className="auth-form">
          {mode === 'register' && (
            <label>
              <span>显示名称</span>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Odd漫创用户" autoComplete="name" />
            </label>
          )}
          <label>
            <span>邮箱</span>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>
            <span>密码</span>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="至少 8 位" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="button" className="brand-gradient" onClick={() => void submit()} disabled={submitting}>
            {submitting ? '提交中…' : mode === 'login' ? '登录' : '注册'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
