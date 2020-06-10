import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import EditorCore from './EditorCore';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    toolbar: {
      minHeight: 24,            // Size of small IconButotn is 24px.
      backgroundColor: '#FFFFFF',
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerContent: {
    },
    content: {
      flexGrow: 1,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: - drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  })
);

interface EditorProps {};

const Editor : React.SFC<EditorProps> = (props: EditorProps) => {
  const styles = useStyles();
  const [open, setOption] = React.useState(false);

  const handleDrawer = () => {
    setOption(!open);
  };

  return (
    <div className={styles.root}>
      <AppBar position="fixed" elevation={0} className={clsx(styles.appBar, {
        [styles.appBarShift]: open,
      })}>
        <Toolbar className={styles.toolbar} disableGutters={true}>
          <IconButton size="small" onClick={handleDrawer}>
            <MenuIcon></MenuIcon>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer open={open} variant="persistent" className={styles.drawer}
        anchor="left"
        classes={{
          paper: styles.drawerPaper
        }}>
        <Toolbar className={styles.toolbar}></Toolbar> {/* Dummy toolbar */}
        <div className={styles.drawerContent}>
          hoge hoge hoge
        </div>
      </Drawer>
      <div>
        <Toolbar className={styles.toolbar}></Toolbar> {/* Dummy toolbar */}
        <div className={clsx(styles.content, {
          [styles.contentShift]: open,
        })}>
          <EditorCore />
        </div>
      </div>
    </div>
  );
};

export default Editor;
