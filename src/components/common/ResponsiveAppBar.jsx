import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useNavigate } from "react-router-dom";

import api from '../../api';

const pages = ['Habits', 'Activity', 'About Me', 'Contact'];
const settings = ['Profile', 'Dashboard', 'Logout'];


function ResponsiveAppBar() {
    const [userData, setUserData] = useState({}) 
    function capitalizeFirstLetter(word) {
        if(word === null) { return };
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
  
    useEffect(()=>{
        const fetchUserInfo = async()=>{
        try{
            console.log("tryto fetch user info");
            const res = await api.post('/getUserData/',{})
            console.log(`user data is : ${JSON.stringify(res.data)}`)
            setUserData(()=>res.data)
            
        }
        catch(e){
            console.log("but i landed in erroe");
            console.log("e.message: ur operation in error!");
        }
    }
        fetchUserInfo();

    }, [])

    const navigateTo = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleAboutmeRedirect = () => {
        window.location.href = 'https://portfolio.connectwithvaibhav.com';  
      };


    const handleCloseNavMenu = (page) => {
        if (page === 'Activity') {
            navigateTo('/activity_logs', { message: "Landing" })
            
        }
        if (page === 'Habits') {
            navigateTo('/habit_tracker',  { message: "Landing" })
        }
        if (page === 'Contact') {
            navigateTo('/contactme',  { message: "Landing" })
        }
        if (page === 'About Me'){
            handleAboutmeRedirect()
        }
    };

    const handleCloseUserMenu = (signal) => {
        if (signal === 'Logout') {
            navigateTo('/logout', { message: "Landing" })
            
        }else if(signal === 'Profile'){ 
            navigateTo('/profile', { message: "Landing" })
        }else{
            setAnchorElUser(null);
        }
        
    };

   
    return (
        <AppBar sx= {{  backgroundColor: '#3AA6B9'}}position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                          
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',  
                            fontSize: '2rem',
                            fontStyle: 'unset',
                            letterSpacing: '.2rem',
                            color: 'inherit',   
                            textDecoration: 'none',
                        }}
                        onClick={() => navigateTo('/')}
                    >
                         Activity Tracker
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={()=> handleOpenNavMenu()}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={()=> handleCloseNavMenu('')}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={()=>handleCloseNavMenu(page)}>
                                    <Typography style={{
                                         fontFamily: 'monospace',  
                                         fontStyle: 'italic',
                                    }}>{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',  
                            fontStyle: 'italic',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>
                    <Box sx={{ flexGrow: 1, marginLeft: '5rem',display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={()=>handleCloseNavMenu(page)}
                                sx={{ my: 2, color: 'white', display: 'block',  fontFamily: 'monospace',  
                                fontStyle: 'unset',fontSize:'1rem', fontWeight: 700, marginLeft:'2rem'}}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0}}>
                                <Avatar alt="Remy Sharp" src="/user.png" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={()=>handleCloseUserMenu('')}
                        >  <div style={{
                          margin: '1rem'  
                        }}> <h2 style={{
                            color: 'midnightblue',
                            fontFamily: 'cursive',
                            fontSize: '1.5rem',
                            fontWeight: 700,    
                            letterSpacing: '.2rem',
                            textDecoration: 'underline',
                            padding: '1rem',
                        }}> Hey {capitalizeFirstLetter(userData.username || null)}!</h2>
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={()=>handleCloseUserMenu(setting)}>
                                    <Typography sx={{
                                        color:'midnightblue',
                                        fontFamily: 'cursive',
                                        letterSpacing: '.2rem',

                                    }} textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                           </div>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;