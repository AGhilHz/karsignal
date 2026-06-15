'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Shield, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function CommunityPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [page, setPage] = useState(1);
  const [newPost, setNewPost] = useState({ title: '', body: '', topicId: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: topicsData } = useQuery({
    queryKey: ['topics'],
    queryFn: () => communityApi.getTopics(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['discussions', selectedTopic, page],
    queryFn: () => communityApi.getDiscussions({
      topicId: selectedTopic || undefined,
      page,
      limit: 20,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => communityApi.createDiscussion(data),
    onSuccess: () => {
      toast.success('پست شما منتشر شد');
      setDialogOpen(false);
      setNewPost({ title: '', body: '', topicId: '' });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا'),
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: 1 | -1 }) =>
      communityApi.vote(id, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discussions'] }),
  });

  const topics = topicsData?.data?.data || [];
  const discussions = data?.data?.data?.discussions || [];
  const meta = data?.data?.data?.meta;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold">انجمن</h1>
              </div>
              <p className="text-muted-foreground">بحث‌های ناشناس درباره بازار کار ایران</p>
            </div>
            {isAuthenticated ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> پست جدید</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>پست جدید</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                    <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                    پست شما به صورت کاملاً ناشناس منتشر می‌شود
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>موضوع</Label>
                      <Select value={newPost.topicId} onValueChange={v => setNewPost(p => ({ ...p, topicId: v }))}>
                        <SelectTrigger><SelectValue placeholder="انتخاب موضوع" /></SelectTrigger>
                        <SelectContent>
                          {topics.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>عنوان *</Label>
                      <Input
                        value={newPost.title}
                        onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                        placeholder="عنوان پست خود را بنویسید"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>متن *</Label>
                      <Textarea
                        value={newPost.body}
                        onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))}
                        placeholder="متن پست خود را بنویسید..."
                        rows={5}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => createMutation.mutate(newPost)}
                        disabled={createMutation.isPending || !newPost.title || !newPost.body}
                      >
                        {createMutation.isPending ? 'در حال انتشار...' : 'انتشار'}
                      </Button>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="outline" asChild>
                <a href="/auth/login">برای پست کردن وارد شوید</a>
              </Button>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Topics sidebar */}
            <aside className="w-full lg:w-56 shrink-0">
              <h3 className="font-semibold text-sm mb-3">موضوعات</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTopic('')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${!selectedTopic ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  همه بحث‌ها
                </button>
                {topics.map((topic: any) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${selectedTopic === topic.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </aside>

            {/* Discussions */}
            <div className="flex-1 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : discussions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>هنوز بحثی وجود ندارد</p>
                </div>
              ) : (
                discussions.map((d: any) => (
                  <Card key={d.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        {/* Vote column */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button
                            onClick={() => isAuthenticated && voteMutation.mutate({ id: d.id, value: 1 })}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <span className="text-sm font-medium">{d.upvotes - d.downvotes}</span>
                          <button
                            onClick={() => isAuthenticated && voteMutation.mutate({ id: d.id, value: -1 })}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm leading-snug">{d.title}</h3>
                            {d.topic && (
                              <Badge variant="secondary" className="text-xs shrink-0">{d.topic.name}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{d.body}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {d._count?.comments || 0} پاسخ
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {d.viewCount}
                            </span>
                            <span>{d.authorDisplayName}</span>
                            <span className="mr-auto">
                              {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true, locale: faIR })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>قبلی</Button>
                  <span className="flex items-center text-sm text-muted-foreground px-3">
                    {page} / {meta.totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>بعدی</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
