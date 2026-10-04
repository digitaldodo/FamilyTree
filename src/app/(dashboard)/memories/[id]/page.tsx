import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { ArrowLeft, Calendar, MapPin, Tag, Users, Image as ImageIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getMemoryCover } from '@/lib/memory-cover';
import { MemoryActions } from '@/components/features/memories/memory-actions';

export default async function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;
  
  const memory = await prisma.memory.findUnique({
    where: { id },
    include: {
      media: true,
      members: {
        include: {
          member: true
        }
      },
      tree: {
        include: {
          collaborators: true
        }
      }
    }
  });

  if (!memory) return notFound();

  // Validate permission
  const isOwner = memory.tree.ownerId === session.user?.id;
  const isCreator = memory.createdById === session.user?.id;
  const isCollaborator = memory.tree.collaborators.some(
    (c: any) => c.userId === session.user?.id && (c.role === 'EDITOR' || c.role === 'ADMIN')
  );

  if (!isOwner && !isCreator && !isCollaborator) {
    return notFound();
  }

  const coverUrl = getMemoryCover(memory);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <MemoryActions memory={memory} treeId={memory.treeId} />
      </div>

      {/* Hero Section */}
      <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-sm mb-12">
        {coverUrl ? (
          <div className="w-full aspect-[21/9] md:aspect-[3/1] relative bg-muted">
             {coverUrl.includes('cloudinary') ? (
               <CldImage
                 src={coverUrl}
                 alt={memory.title}
                 fill
                 className="object-cover"
                 sizes="100vw"
               />
             ) : (
               <img
                 src={coverUrl}
                 alt={memory.title}
                 className="w-full h-full object-cover"
               />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
             
             <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
               <div className="flex flex-col gap-2">
                 <span className="text-xs font-medium bg-primary/20 text-primary-foreground backdrop-blur-md px-3 py-1 rounded-full w-fit">
                   {new Date(memory.date).getFullYear()}
                 </span>
                 <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">{memory.title}</h1>
               </div>
             </div>
          </div>
        ) : (
          <div className="w-full py-16 px-6 md:px-10 bg-gradient-to-br from-primary/5 to-muted border-b border-border">
             <div className="flex flex-col gap-3 max-w-2xl">
               <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full w-fit">
                 {new Date(memory.date).getFullYear()}
               </span>
               <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">{memory.title}</h1>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {memory.description && (
            <section>
              <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                The Story
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {memory.description}
              </div>
            </section>
          )}

          {/* Photo Gallery */}
          {(memory.media.length > 0 || memory.googlePhotosAlbumUrl) && (
            <section className="pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Photos
                </h2>
                {memory.googlePhotosAlbumUrl && (
                  <a 
                    href={memory.googlePhotosAlbumUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Open in Google Photos
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
              
              {memory.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {memory.media.map((media: any) => (
                    <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                      {media.url.includes('cloudinary') ? (
                        <CldImage
                          src={media.url}
                          alt="Memory photo"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <img
                          src={media.url}
                          alt="Memory photo"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted rounded-xl p-8 text-center border border-border">
                  <p className="text-muted-foreground mb-4">Photos are stored in an external Google Photos album.</p>
                  {memory.googlePhotosAlbumUrl && (
                    <a 
                      href={memory.googlePhotosAlbumUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                      View Album
                    </a>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-8">
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-medium mb-4 text-foreground">Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(memory.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {memory.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{memory.location}</p>
                  </div>
                </div>
              )}

              {memory.type && memory.type !== 'MEMORY' && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Event Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{memory.type.toLowerCase()}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {memory.members.length > 0 && (
            <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-medium mb-4 text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                People Involved
              </h3>
              <div className="space-y-3">
                {memory.members.map((mm: any) => (
                  <Link 
                    key={mm.memberId} 
                    href={`/profile?id=${mm.memberId}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-secondary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex-shrink-0 relative">
                      {mm.member.imageUrl ? (
                        mm.member.imageUrl.includes('cloudinary') ? (
                          <CldImage
                            src={mm.member.imageUrl}
                            alt={mm.member.firstName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <img
                            src={mm.member.imageUrl}
                            alt={mm.member.firstName}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                          {mm.member.firstName[0]}{mm.member.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {mm.member.firstName} {mm.member.lastName}
                      </p>
                      {mm.member.birthDate && (
                        <p className="text-xs text-muted-foreground">
                          Born {new Date(mm.member.birthDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
