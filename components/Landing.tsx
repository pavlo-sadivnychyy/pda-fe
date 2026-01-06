import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    Stack,
    Chip,
} from '@mui/material';
import {useRouter} from "next/navigation";

const features = [
    {
        icon: '💬',
        title: 'AI-чат, який працює як бізнес-помічник',
        items: [
            'відповідає на питання про бізнес',
            'генерує тексти, ідеї, відповіді клієнтам',
            'дає поради та сценарії дій',
        ],
    },
    {
        icon: '📄',
        title: 'Робота з документами',
        items: [
            'пояснює складні документи простою мовою',
            'аналізує договори',
            'допомагає редагувати та створювати нові документи',
        ],
    },
    {
        icon: '🧠',
        title: '"Памʼять" бізнесу',
        items: [
            'знає твої послуги',
            'розуміє цільову аудиторію',
            'зберігає стиль бренду',
            'використовує це у відповідях',
        ],
    },
    {
        icon: '📋',
        title: 'Готові шаблони та сценарії',
        items: [
            'пости',
            'листи клієнтам',
            'відповіді на скарги',
            'комерційні тексти',
            'FAQ',
            'документи',
        ],
    },
];

const targetAudience = [
    { emoji: '🏪', label: 'малий бізнес' },
    { emoji: '🛒', label: 'e-commerce' },
    { emoji: '🧑‍⚕️', label: 'сервіси та спеціалісти' },
    { emoji: '📈', label: 'маркетологи' },
    { emoji: '⚙️', label: 'підприємці-одинаки' },
];

const benefits = [
    {
        title: 'Дешевше, ніж наймати людей',
        description: 'копірайтер, маркетолог, юрист = дорого. Тут — одна підписка.',
    },
    {
        title: 'Простіше, ніж користуватись "просто AI"',
        description: 'нічого не треба налаштовувати, сервіс уже заточений під бізнес.',
    },
    {
        title: 'Швидше, ніж робити самому',
        description: 'результат за секунди, без нервів.',
    },
];

const AIAssistantLanding = () => {
    const router = useRouter();


    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Navigation */}
            <Box
                sx={{
                    bgcolor: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: { xs: 2, sm: 2.5 },
                        px: { xs: 2, sm: 0 },
                        flexWrap: 'wrap',
                        gap: { xs: 2, sm: 0 }
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#2c2c2c',
                                fontWeight: 700,
                                fontSize: { xs: '1.3rem', sm: '1.5rem' }
                            }}
                        >
                            AI Асистент
                        </Typography>
                        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
                            <Button
                                onClick={() => router.push('/sign-in')}
                                sx={{
                                    color: '#666',
                                    textTransform: 'none',
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    fontWeight: 500,
                                    borderRadius: '12px',
                                    px: { xs: 2, sm: 3 },
                                    minWidth: { xs: 'auto', sm: 'auto' },
                                    '&:hover': {
                                        bgcolor: '#f5f5f5',
                                    }
                                }}
                            >
                                Увійти
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => router.push('/sign-up')}
                                sx={{
                                    bgcolor: '#3b3b3b',
                                    textTransform: 'none',
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    fontWeight: 500,
                                    borderRadius: '12px',
                                    px: { xs: 2, sm: 3 },
                                    minWidth: { xs: 'auto', sm: 'auto' },
                                    boxShadow: 'none',
                                    '&:hover': {
                                        bgcolor: '#2c2c2c',
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                Зареєструватися
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box sx={{ bgcolor: 'white', py: { xs: 6, sm: 10, md: 16 } }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 3, md: 0 } }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 700,
                                mb: { xs: 3, sm: 4 },
                                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem', lg: '4.2rem' },
                                color: '#1a1a1a',
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Твій особистий AI-асистент для щоденних бізнес-задач
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: { xs: 4, sm: 5, md: 6 },
                                color: '#737373',
                                lineHeight: 1.7,
                                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem', lg: '1.35rem' },
                                fontWeight: 400,
                                maxWidth: '700px',
                                mx: 'auto',
                            }}
                        >
                            Інструмент, який допомагає малому бізнесу швидше відповідати клієнтам, створювати контент, працювати з документами та приймати рішення — без складних налаштувань і зайвих витрат.
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 2, sm: 2.5 }}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => router.push('/sign-up')}
                                sx={{
                                    bgcolor: '#3b3b3b',
                                    px: { xs: 4, sm: 6 },
                                    py: { xs: 1.5, sm: 2 },
                                    textTransform: 'none',
                                    fontSize: { xs: '1rem', sm: '1.15rem' },
                                    fontWeight: 600,
                                    borderRadius: '16px',
                                    boxShadow: 'none',
                                    minWidth: { xs: '100%', sm: '200px' },
                                    maxWidth: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        bgcolor: '#2c2c2c',
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                Зареєструватися
                            </Button>
                            <Button
                                onClick={() => router.push('/sign-in')}
                                variant="outlined"
                                size="large"
                                sx={{
                                    borderColor: '#d4d4d4',
                                    color: '#525252',
                                    px: { xs: 4, sm: 6 },
                                    py: { xs: 1.5, sm: 2 },
                                    textTransform: 'none',
                                    fontSize: { xs: '1rem', sm: '1.15rem' },
                                    fontWeight: 600,
                                    borderRadius: '16px',
                                    borderWidth: '1.5px',
                                    minWidth: { xs: '100%', sm: '200px' },
                                    maxWidth: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        borderColor: '#a3a3a3',
                                        bgcolor: '#fafafa',
                                        borderWidth: '1.5px',
                                    },
                                }}
                            >
                                Увійти
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* About Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 10, md: 14 } }}>
                <Box sx={{ textAlign: 'center', mb: { xs: 6, sm: 8, md: 10 }, px: { xs: 2, sm: 3, md: 0 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: { xs: 3, sm: 4 },
                            color: '#1a1a1a',
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Що це за сервіс
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#737373',
                            maxWidth: '750px',
                            mx: 'auto',
                            lineHeight: 1.8,
                            fontWeight: 400,
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        }}
                    >
                        Це не просто AI-чат. Це асистент, який знає твій бізнес, памʼятає інформацію, працює з твоїми документами, допомагає з клієнтами та контентом — і завжди під рукою.
                    </Typography>
                </Box>

                {/* Icon Points */}
                <Box sx={{ maxWidth: '1100px', mx: 'auto', mb: { xs: 6, sm: 10, md: 14 }, px: { xs: 2, sm: 3, md: 0 } }}>
                    <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                        {[
                            { icon: '✓', text: 'Розуміє твій бізнес' },
                            { icon: '✓', text: 'Памʼятає контекст' },
                            { icon: '✓', text: 'Підказує, пояснює, генерує' },
                            { icon: '✓', text: 'Працює 24/7' },
                        ].map((item, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        textAlign: 'center',
                                        py: { xs: 4, sm: 5 },
                                        px: { xs: 2, sm: 3 },
                                        bgcolor: 'white',
                                        borderRadius: { xs: '20px', sm: '24px' },
                                        transition: 'all 0.3s ease',
                                        border: '1px solid #f0f0f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: { xs: '140px', sm: '160px' },
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            color: '#e5e5e5',
                                            mb: { xs: 2, sm: 2.5 },
                                            fontWeight: 700,
                                            fontSize: { xs: '2.5rem', sm: '3rem' }
                                        }}
                                    >
                                        {item.icon}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            color: '#404040',
                                            fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                            lineHeight: 1.5
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Features */}
                <Box sx={{ mb: { xs: 6, sm: 10, md: 14 }, px: { xs: 2, sm: 3, md: 0 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: { xs: 5, sm: 6, md: 8 },
                            textAlign: 'center',
                            color: '#1a1a1a',
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Основні можливості
                    </Typography>

                    <Box sx={{ maxWidth: '1100px', mx: 'auto' }}>
                        <Grid container spacing={{ xs: 3, sm: 4 }} justifyContent="center">
                            {features.map((feature, idx) => (
                                <Grid item xs={12} md={6} key={idx}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            height: '100%',
                                            p: { xs: 3, sm: 4, md: 5 },
                                            bgcolor: 'white',
                                            borderRadius: { xs: '20px', sm: '24px' },
                                            transition: 'all 0.3s ease',
                                            border: '1px solid #f0f0f0',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2.5 } }}>
                                            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, flexShrink: 0 }}>
                                                {feature.icon}
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#1a1a1a',
                                                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>
                                        </Box>
                                        <Box component="ul" sx={{ pl: { xs: 1.5, sm: 2 }, m: 0 }}>
                                            {feature.items.map((item, i) => (
                                                <Typography
                                                    component="li"
                                                    key={i}
                                                    sx={{
                                                        mb: { xs: 1, sm: 1.5 },
                                                        color: '#737373',
                                                        lineHeight: 1.7,
                                                        fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                                    }}
                                                >
                                                    {item}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>

                {/* Target Audience */}
                <Box sx={{ textAlign: 'center', mb: { xs: 6, sm: 10, md: 14 }, px: { xs: 2, sm: 3, md: 0 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: { xs: 4, sm: 5, md: 6 },
                            color: '#1a1a1a',
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Для кого цей сервіс
                    </Typography>
                    <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: { xs: 1.5, sm: 2, md: 2.5 },
                                mb: { xs: 4, sm: 5, md: 6 }
                            }}
                        >
                            {targetAudience.map((item, idx) => (
                                <Chip
                                    key={idx}
                                    label={`${item.emoji} ${item.label}`}
                                    sx={{
                                        py: { xs: 3, sm: 3.5 },
                                        px: { xs: 2.5, sm: 3.5 },
                                        fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                        fontWeight: 500,
                                        bgcolor: 'white',
                                        border: '1.5px solid #e5e5e5',
                                        color: '#404040',
                                        borderRadius: { xs: '14px', sm: '16px' },
                                        transition: 'all 0.3s ease',
                                        height: 'auto',
                                        '& .MuiChip-label': {
                                            padding: 0,
                                            whiteSpace: 'normal',
                                            textAlign: 'center',
                                        },
                                        '&:hover': {
                                            bgcolor: '#fafafa',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#737373',
                            mt: { xs: 3, sm: 4, md: 5 },
                            fontWeight: 400,
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.6,
                            px: { xs: 2, sm: 0 }
                        }}
                    >
                        Якщо у тебе є бізнес-рутина — асистент допоможе з нею справитись.
                    </Typography>
                </Box>

                {/* Benefits */}
                <Box sx={{ mb: { xs: 6, sm: 10, md: 14 }, px: { xs: 2, sm: 3, md: 0 } }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: { xs: 5, sm: 6, md: 8 },
                            textAlign: 'center',
                            color: '#1a1a1a',
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Чому це вигідніше, ніж люди або ChatGPT
                    </Typography>
                    <Box sx={{ maxWidth: '1100px', mx: 'auto' }}>
                        <Grid container spacing={{ xs: 3, sm: 4 }} justifyContent="center">
                            {benefits.map((benefit, idx) => (
                                <Grid item xs={12} sm={6} md={4} key={idx}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            height: '100%',
                                            p: { xs: 4, sm: 5 },
                                            textAlign: 'center',
                                            bgcolor: 'white',
                                            borderRadius: { xs: '20px', sm: '24px' },
                                            transition: 'all 0.3s ease',
                                            border: '1px solid #f0f0f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: { xs: '180px', sm: '200px' },
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                mb: { xs: 2, sm: 2.5 },
                                                color: '#1a1a1a',
                                                lineHeight: 1.4,
                                                fontSize: { xs: '1.2rem', sm: '1.4rem' },
                                            }}
                                        >
                                            {benefit.title}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: '#737373',
                                                lineHeight: 1.7,
                                                fontSize: { xs: '0.95rem', sm: '1.05rem' }
                                            }}
                                        >
                                            {benefit.description}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>

                {/* Security */}
                <Box sx={{ maxWidth: '1000px', mx: 'auto', px: { xs: 2, sm: 3, md: 0 } }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, sm: 6, md: 8 },
                            textAlign: 'center',
                            bgcolor: 'white',
                            borderRadius: { xs: '24px', sm: '32px' },
                            border: '1px solid #f0f0f0',
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: { xs: 5, sm: 6, md: 7 },
                                color: '#1a1a1a',
                                fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.5rem' }
                            }}
                        >
                            Безпека та конфіденційність
                        </Typography>
                        <Grid container spacing={{ xs: 4, sm: 5 }} justifyContent="center">
                            {[
                                { icon: '🛡️', text: 'Дані захищені' },
                                { icon: '🔒', text: 'Документи не публічні' },
                                { icon: '✓', text: 'Ми не передаємо інформацію третім сторонам' },
                            ].map((item, idx) => (
                                <Grid item xs={12} sm={4} key={idx}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="h2" sx={{ mb: { xs: 2, sm: 2.5 }, fontSize: { xs: '2.5rem', sm: '3rem' } }}>
                                            {item.icon}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#404040',
                                                fontWeight: 500,
                                                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                                lineHeight: 1.6,
                                                maxWidth: '200px'
                                            }}
                                        >
                                            {item.text}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Box>
            </Container>

            {/* CTA Section */}
            <Box sx={{ bgcolor: 'white', py: { xs: 6, sm: 10, md: 14 } }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 3, md: 0 } }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: { xs: 3, sm: 4 },
                                color: '#1a1a1a',
                                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Почни користуватись сьогодні
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: { xs: 4, sm: 5, md: 6 },
                                color: '#737373',
                                fontWeight: 400,
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                lineHeight: 1.7,
                                maxWidth: '650px',
                                mx: 'auto'
                            }}
                        >
                            Зареєструйся, створи профіль бізнесу — і отримай свого особистого AI-асистента протягом декількох хвилин.
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 2, sm: 2.5 }}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => router.push('/sign-up')}
                                sx={{
                                    bgcolor: '#F36B16',
                                    px: { xs: 4, sm: 6 },
                                    py: { xs: 2, sm: 2.5 },
                                    textTransform: 'none',
                                    fontSize: { xs: '1rem', sm: '1.15rem' },
                                    fontWeight: 600,
                                    borderRadius: '16px',
                                    boxShadow: 'none',
                                    minWidth: { xs: '100%', sm: '200px' },
                                    maxWidth: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        bgcolor: '#d95a0f',
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                Зареєструватися
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => router.push('/sign-in')}
                                sx={{
                                    borderColor: '#d4d4d4',
                                    color: '#525252',
                                    px: { xs: 4, sm: 6 },
                                    py: { xs: 2, sm: 2.5 },
                                    textTransform: 'none',
                                    fontSize: { xs: '1rem', sm: '1.15rem' },
                                    fontWeight: 600,
                                    borderRadius: '16px',
                                    borderWidth: '1.5px',
                                    minWidth: { xs: '100%', sm: '200px' },
                                    maxWidth: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        borderColor: '#a3a3a3',
                                        bgcolor: '#fafafa',
                                        borderWidth: '1.5px',
                                    },
                                }}
                            >
                                Увійти
                            </Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#2c2c2c', color: 'white', py: { xs: 6, sm: 8 } }}>
                <Container maxWidth="lg">
                    <Grid
                        container
                        spacing={{ xs: 3, sm: 5 }}
                        justifyContent="center"
                        sx={{
                            textAlign: { xs: 'center', sm: 'left' },
                            px: { xs: 2, sm: 0 }
                        }}
                    >
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                Про сервіс
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                FAQ
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                Контакти
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" sx={{ mb: 1, opacity: 0.7, fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                                Політика конфіденційності
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7, fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                                Умови користування
                            </Typography>
                        </Grid>
                    </Grid>
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            mt: { xs: 6, sm: 8 },
                            opacity: 0.6,
                            fontSize: { xs: '0.9rem', sm: '0.95rem' }
                        }}
                    >
                        © 2026 AI Асистент. Всі права захищені.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default AIAssistantLanding;