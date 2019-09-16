import React from 'react';
import {
	StyleSheet,
	View,
	StatusBar,
	ActivityIndicator,
	ScrollView,
	AsyncStorage
} from 'react-native';
import { LinearGradient } from 'expo';
import { primaryGradientArray } from './utils/Colors';
import Header from './components/Header';
import Input from './components/Input';
import List from './components/List';

const headerTitle = 'Todo';

export default class Main extends React.Component {
	state = {
		inputValue: '',
		loadingItems: false,
		allItems: {},
		isCompleted: false
	};


	async createItemAPI(input) {
		const response = await fetch('http://localhost:3000/list/7/item', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				text: input,
			}),
		});

		/* This is the proper way to parse the data */
		response.json().then(data => {
			console.log(data.id);
			return data.id;
		});

	}

	async completeItemAPI(id) {
		/* This is the correct syntax when you add a variable into the mix */
		await fetch(`http://localhost:3000/list/item/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			}
		})
	}

	async incompleteItemAPI(id) {
		/* This is the correct syntax when you add a variable into the mix */
		await fetch(`http://localhost:3000/list/item/${id}/incomplete`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			}
		})
	}

	async deleteItemAPI(id) {
		await fetch(`http://localhost:3000/list/item/${id}`, {
			method: 'DELETE',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		})
	}

	componentDidMount = () => {
		this.loadingItems();
	};

	newInputValue = value => {
		this.setState({
			inputValue: value
		});
	};

	loadingItems = async () => {
		let items = {};
		try {
			const getItems = await fetch("http://localhost:3000/list/7", {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			});
			const json = await getItems.json();
			for (let i = 0; i < json.items.length; i++) {
				items = json.items[i].id;
			}
			this.setState({
				loadingItems: true,
				allItems: json.items
			});
			return json.items;
		} catch (err) {
			console.log(err);
		}
	};

	onDoneAddItem = async () => {
		const { inputValue } = this.state;
		const id = await this.createItemAPI(inputValue);
		if (inputValue !== '') {
			this.setState(prevState => {
				/* Update state so change is immediate on frontend */
				const newItemObject = {
					[id]: {
						id,
						complete: 0,
						text: inputValue,
						createdAt: Date.now()
					}
				};
				const newState = {
					...prevState,
					inputValue: '',
					allItems: {
						...prevState.allItems,
						...newItemObject
					}
				};

				/* This adds it to the database so it will be persistent */
				return { ...newState };
			});
		}
	};

	/* TODO: Make this change state */
	deleteItem = id => {
		this.deleteItemAPI(id);
		this.setState(prevState => {
			const allItems = prevState.allItems;
			allItems.find((o, i) => {
				if (o.id === id) {
					delete allItems[i];
					return true;
				}
				return false;
			});
			const newState = {
				...prevState,
				allItems
			};
			return { ...newState };
		});
	};

	/* TODO: Make this change state */
	completeItem = id => {
		this.setState(prevState => {
			const allItems = prevState.allItems;
			allItems.find((o, i) => {
				if (o.id === id) {
					allItems[i].complete = 1;
					return true;
				}
				return false;
			});
			const newState = {
				...prevState,
				allItems
			};
			return { ...newState };
		});
	};

	/* TODO: Make this change state */
	incompleteItem = id => {
		this.setState(prevState => {
			const allItems = prevState.allItems;
			allItems.find((o, i) => {
				if (o.id === id) {
					allItems[i].complete = 0;
					return true;
				}
				return false;
			});
			const newState = {
				...prevState,
				allItems
			};
			return { ...newState };
		});
	};

	render() {
		const { inputValue, allItems } = this.state;

		return (
			<LinearGradient colors={primaryGradientArray} style={styles.container}>
				<StatusBar barStyle="light-content" />
				<View style={styles.centered}>
					<Header title={headerTitle} />
				</View>
				<View style={styles.inputContainer}>
					<Input
						inputValue={inputValue}
						onChangeText={this.newInputValue}
						onDoneAddItem={this.onDoneAddItem}
					/>
				</View>
				<View style={styles.list}>
						<ScrollView contentContainerStyle={styles.scrollableList}>
							{Object.values(allItems)
								.map(item => (
									<List
										key={item.id}
										{...item}
										deleteItem={this.deleteItem}
										completeItem={this.completeItem}
										incompleteItem={this.incompleteItem}
									/>
								))}
						</ScrollView>
				</View>
			</LinearGradient>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	centered: {
		alignItems: 'center'
	},
	inputContainer: {
		marginTop: 40,
		paddingLeft: 15
	},
	list: {
		flex: 1,
		marginTop: 70,
		paddingLeft: 15,
		marginBottom: 10
	},
	scrollableList: {
		marginTop: 15
	},
	column: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	deleteAllButton: {
		marginRight: 40
	}
});
