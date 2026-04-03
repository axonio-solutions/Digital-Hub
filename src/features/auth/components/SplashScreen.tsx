import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

// In a real implementation this would navigate using @tanstack/react-router
// import { useNavigate } from "@tanstack/react-router"

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const { t } = useTranslation('auth/splash')
  // const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Splash timeout complete, transitioning to next screen.')
      if (onComplete) {
        onComplete()
      } else {
        // navigate({ to: '/login' })
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-primary text-primary-foreground max-w-md mx-auto relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center z-10"
      >
        <div className="rounded-full bg-primary-foreground/20 p-6 backdrop-blur-sm mb-6">
          <h1 className="text-4xl font-extrabold tracking-tighter text-primary-foreground">
            {t('splash.title')}
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg font-medium text-primary-foreground/90"
        >
          {t('splash.subtitle')}
        </motion.p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 flex space-x-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary-foreground"
            animate={{
              y: ['0%', '-50%', '0%'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
