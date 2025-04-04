import NextAuth, { DefaultSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) {
          throw new Error(error.message)
        }

        if (!user) {
          throw new Error('No user found')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
        }
      }
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) return false;
        
        console.log(`User signing in: ${user.email}`);
        
        // Check if user exists in Supabase
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.error('Error checking existing user:', userError);
          // If we can't check for the user, still allow sign in
          return true;
        }
        
        // Get available columns from the first user record or create a simpler update
        let availableColumns: string[] = [];
        
        if (existingUser) {
          availableColumns = Object.keys(existingUser);
          console.log('Available columns:', availableColumns);
        }
        
        if (!existingUser) {
          // Create new user in Supabase with only columns that are safe
          const userData: any = {
            email: user.email,
          };
          
          // Only add these fields if they exist in the schema
          if (user.name && availableColumns.includes('name')) {
            userData.name = user.name;
          }
          
          if (account?.provider && availableColumns.includes('provider')) {
            userData.provider = account.provider;
          }
          
          if (user.image && availableColumns.includes('image')) {
            userData.image = user.image;
          }
          
          // Try to create the user, but don't block sign in if it fails
          try {
            const { error: insertError } = await supabase
              .from('users')
              .insert([userData]);
              
            if (insertError) {
              console.error('Error creating user:', insertError);
            }
          } catch (err) {
            console.error('Failed to insert user:', err);
          }
        } else if (availableColumns.length > 0) {
          // Only update fields that exist in the schema
          const updateData: any = {};
          
          if (user.name && availableColumns.includes('name')) {
            updateData.name = user.name;
          }
          
          if (availableColumns.includes('last_login')) {
            updateData.last_login = new Date().toISOString();
          }
          
          if (user.image && availableColumns.includes('image')) {
            updateData.image = user.image;
          }
          
          // Only perform update if there are fields to update
          if (Object.keys(updateData).length > 0) {
            try {
              const { error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('email', user.email);
                
              if (updateError) {
                console.error('Error updating user:', updateError);
              }
            } catch (err) {
              console.error('Failed to update user:', err);
            }
          }
        }
        
        // Allow sign in even if Supabase operations fail
        return true;
      } catch (error) {
        console.error('Authentication error:', error);
        // Still allow sign in if there's an error with Supabase
        return true;
      }
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after sign-in
      return `${baseUrl}/dashboard`;
    },
    async session({ session, user, token }) {
      return session;
    },
  },
})

export { handler as GET, handler as POST } 
