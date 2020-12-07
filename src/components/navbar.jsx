import { Navbar } from 'react-bulma-components';
import { Button } from 'react-bulma-components';

export function NavBar() {
    return (
        <Navbar
            active={true}
            transparent={false}
            color="primary"
        >
            <Navbar.Brand>
                <Navbar.Item renderAs="a" href="/">
                    <img src="/logo.png" alt="Scrypta Dentralized Names" style={{ marginRight: "15px" }} height="28" /> Decentralized Names
                    </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            <Navbar.Menu >
                <Navbar.Container position="end">
                    <Navbar.Item renderAs="a" href="/login">
                        <Button color="secondary">LOGIN</Button>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        </Navbar>
    );
}